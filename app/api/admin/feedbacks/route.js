import clientPromise from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';

export async function GET(req) {
  try {
    const auth = await requireAuth(['admin']);
    if (auth.error) {
      return new Response(JSON.stringify({ error: auth.error }), { status: auth.status });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || 'ssi_portal');

    const feedbacks = await db.collection('feedbacks').find({}).sort({ createdAt: -1 }).toArray();

    // Serialize object IDs
    const serialized = feedbacks.map(f => ({
      _id: f._id.toString(),
      submissionId: f.submissionId.toString(),
      studentId: f.studentId.toString(),
      studentName: f.studentName,
      studentEmail: f.studentEmail,
      examId: f.examId.toString(),
      examTitle: f.examTitle,
      course: f.course,
      ratings: f.ratings,
      suggestions: f.suggestions,
      createdAt: f.createdAt
    }));

    return new Response(JSON.stringify(serialized), { status: 200 });
  } catch (error) {
    console.error('Fetch Feedbacks Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
