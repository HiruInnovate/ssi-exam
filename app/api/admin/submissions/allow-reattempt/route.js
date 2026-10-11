import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { requireAuth } from '@/lib/auth';

export async function POST(req) {
  try {
    const auth = await requireAuth(['admin']);
    if (auth.error) {
      return new Response(JSON.stringify({ error: auth.error }), { status: auth.status });
    }

    const { submissionId, grantExtraAttempt } = await req.json();
    if (!submissionId) {
      return new Response(JSON.stringify({ error: 'Missing submissionId' }), { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || 'ssi_portal');

    // 1. Find submission
    const sub = await db.collection('submissions').findOne({ _id: new ObjectId(submissionId) });
    if (!sub) {
      return new Response(JSON.stringify({ error: 'Submission not found' }), { status: 404 });
    }

    // 2. Fetch associated student and exam
    const student = await db.collection('students').findOne({ _id: sub.studentId });
    const exam = await db.collection('exams').findOne({ _id: sub.examId });

    if (!student || !exam) {
      return new Response(JSON.stringify({ error: 'Student or Exam record not found' }), { status: 404 });
    }

    // 3. Revoke any certificate in issued_certificates
    if (sub.certId) {
      await db.collection('issued_certificates').deleteMany({ certId: sub.certId });
    }
    await db.collection('issued_certificates').deleteMany({
      studentId: sub.studentId,
      examId: sub.examId
    });

    // 4. Update the submission to cancelled / failed
    await db.collection('submissions').updateOne(
      { _id: sub._id },
      {
        $set: {
          status: 'evaluated',
          passed: false,
          certId: null,
          certDate: null,
          certificateUrl: null,
          mailSent: false
        }
      }
    );

    // 5. Calculate attempts and ensure student has attempts remaining
    const totalSubmissions = await db.collection('submissions').countDocuments({
      studentId: sub.studentId,
      examId: sub.examId
    });

    const baseMaxAttempts = exam.maxAttempts || 3;
    let attemptsRemaining = Math.max(0, baseMaxAttempts - totalSubmissions);

    // If no attempts remaining or admin requested extra attempt, ensure at least 1 remaining
    if (attemptsRemaining === 0 || grantExtraAttempt) {
      // Increase student's specific attempts limit for this batch
      const newMaxForBatch = totalSubmissions + 1;
      await db.collection('students').updateOne(
        { _id: student._id },
        {
          $set: {
            [`attempts.${exam.batch}`]: newMaxForBatch
          }
        }
      );
      attemptsRemaining = 1;
    } else {
      // Record current attempts left
      await db.collection('students').updateOne(
        { _id: student._id },
        {
          $set: {
            [`attempts.${exam.batch}`]: attemptsRemaining
          }
        }
      );
    }

    // 6. Log admin activity
    try {
      await db.collection('activities').insertOne({
        studentId: student._id,
        studentName: student.name,
        studentEmail: student.email,
        examId: exam._id,
        examTitle: exam.title,
        type: 'RETAKE_ALLOWED',
        message: `Admin cancelled pass evaluation for ${student.name} to allow re-attempt. Remaining attempts: ${attemptsRemaining}.`,
        timestamp: new Date()
      });
    } catch (logErr) {
      console.warn('Could not record activity log:', logErr.message);
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Pass evaluation cancelled. ${student.name} can now re-attempt the exam with ${attemptsRemaining} attempt(s) remaining.`,
      attemptsLeft: attemptsRemaining,
      submissionId: sub._id.toString()
    }), { status: 200 });

  } catch (error) {
    console.error('Allow Reattempt API Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error: ' + error.message }), { status: 500 });
  }
}
