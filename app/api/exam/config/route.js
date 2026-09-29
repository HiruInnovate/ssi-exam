import clientPromise from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function GET(req) {
  try {
    const auth = await requireAuth(['student']);
    if (auth.error) return new Response(JSON.stringify({ error: auth.error }), { status: auth.status });

    const { searchParams } = new URL(req.url);
    const examId = searchParams.get('id');

    if (!examId) return new Response(JSON.stringify({ error: 'Exam ID required' }), { status: 400 });

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || 'ssi_portal');

    const exam = await db.collection('exams').findOne(
      { _id: new ObjectId(examId) },
      { projection: { title: 1, duration: 1, rules: 1, batch: 1 } } // Exclude questions for config fetch
    );

    if (!exam) return new Response(JSON.stringify({ error: 'Exam not found' }), { status: 404 });

    return new Response(JSON.stringify({ exam }), { status: 200 });
  } catch (error) {
    console.error('Config Fetch Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
