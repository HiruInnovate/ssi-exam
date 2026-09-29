import clientPromise from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function POST(req) {
  try {
    const auth = await requireAuth(['student']);
    if (auth.error) {
      return new Response(JSON.stringify({ error: auth.error }), { status: auth.status });
    }

    const { submissionId, ratings, suggestions } = await req.json();

    if (!submissionId || !ratings) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || 'ssi_portal');

    // Retrieve the submission to find examId and course details safely
    const submission = await db.collection('submissions').findOne({ 
      _id: new ObjectId(submissionId),
      studentId: new ObjectId(auth.user.id)
    });

    if (!submission) {
      return new Response(JSON.stringify({ error: 'Submission not found' }), { status: 404 });
    }

    // Check if feedback already submitted to prevent duplicates
    const existing = await db.collection('feedbacks').findOne({ submissionId: submission._id });
    if (existing) {
      return new Response(JSON.stringify({ error: 'Feedback already submitted' }), { status: 400 });
    }

    const exam = await db.collection('exams').findOne({ _id: submission.examId });
    const student = await db.collection('students').findOne({ _id: new ObjectId(auth.user.id) });

    await db.collection('feedbacks').insertOne({
      submissionId: submission._id,
      studentId: student._id,
      studentName: student.name,
      studentEmail: student.email,
      examId: exam._id,
      examTitle: exam.title,
      course: exam.batch, // Extracted for grouping/filtering in Admin Panel
      ratings,
      suggestions: suggestions || '',
      createdAt: new Date()
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Feedback Submit Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
