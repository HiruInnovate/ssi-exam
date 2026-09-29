import clientPromise from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function POST(req) {
  try {
    const auth = await requireAuth(['student']);
    if (auth.error) return new Response(JSON.stringify({ error: auth.error }), { status: auth.status });

    const { type, examId, examTitle, message } = await req.json();

    if (!type || !examId) {
      return new Response(JSON.stringify({ error: 'Missing log data' }), { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || 'ssi_portal');

    const activity = {
      studentId: new ObjectId(auth.user.id),
      studentName: auth.user.name,
      studentEmail: auth.user.email,
      examId: new ObjectId(examId),
      examTitle: examTitle || 'Unknown Exam',
      type, // 'STARTED', 'TAB_SWITCH', 'SUBMITTED', etc.
      message: message || '',
      timestamp: new Date()
    };

    await db.collection('activities').insertOne(activity);

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Activity Logging Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
