import clientPromise from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';

export async function GET(req) {
  try {
    const auth = await requireAuth(['student']);
    if (auth.error) return new Response(JSON.stringify({ error: auth.error }), { status: auth.status });

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || 'ssi_portal');
    
    // Fetch all active courses
    const courses = await db.collection('courses').find({}).sort({ _id: -1 }).toArray();

    return new Response(JSON.stringify(courses), { status: 200 });
  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
