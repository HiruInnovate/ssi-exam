import clientPromise from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';

export async function GET(req) {
  try {
    const auth = await requireAuth(['admin']);
    if (auth.error) return new Response(JSON.stringify({ error: auth.error }), { status: auth.status });

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const skip = (page - 1) * limit;

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || 'ssi_portal');

    const activities = await db.collection('activities')
      .find({})
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await db.collection('activities').countDocuments();

    return new Response(JSON.stringify({ 
      activities, 
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    }), { status: 200 });
  } catch (error) {
    console.error('Activity Fetch Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
