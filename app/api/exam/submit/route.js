import clientPromise from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function POST(req) {
  try {
    const auth = await requireAuth(['student']);
    if (auth.error) return new Response(JSON.stringify({ error: auth.error }), { status: auth.status });

    const { examId, mcqAnswers, codingAnswers } = await req.json();

    if (!examId) return new Response(JSON.stringify({ error: 'Exam ID required' }), { status: 400 });

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || 'ssi_portal');

    // Find the currently open session (latest started status)
    const activeSubmission = await db.collection('submissions').findOne(
      { studentId: new ObjectId(auth.user.id), examId: new ObjectId(examId), status: 'started' },
      { sort: { startedAt: -1 } }
    );

    if (!activeSubmission) {
      return new Response(JSON.stringify({ error: 'No active exam session found' }), { status: 400 });
    }

    // Update with answers and change status to pending for midnight batch
    await db.collection('submissions').updateOne(
      { _id: activeSubmission._id },
      { 
        $set: { 
           mcqAnswers: mcqAnswers || {},
           codingAnswers: codingAnswers || {},
           submittedAt: new Date(),
           status: 'pending' // Ready for offline evaluation
        }
      }
    );
    
    return new Response(JSON.stringify({ 
      success: true, 
      submissionId: activeSubmission._id.toString() 
    }), { status: 200 });
  } catch (error) {
    console.error('Exam Submit Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
