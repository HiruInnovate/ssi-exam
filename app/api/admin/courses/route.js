import clientPromise from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';

export async function GET(req) {
  try {
    const auth = await requireAuth(['admin']);
    if (auth.error) return new Response(JSON.stringify({ error: auth.error }), { status: auth.status });

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || 'ssi_portal');
    
    const courses = await db.collection('courses').find({}).sort({ _id: -1 }).toArray();

    return new Response(JSON.stringify(courses), { status: 200 });
  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

export async function POST(req) {
  try {
    const auth = await requireAuth(['admin']);
    if (auth.error) return new Response(JSON.stringify({ error: auth.error }), { status: auth.status });

    const payload = await req.json();

    if (!payload.title || !payload.razorpayLink) {
       return new Response(JSON.stringify({ error: 'Missing title or razorpayLink' }), { status: 400 });
    }

    const newCourse = {
      title: payload.title,
      description: payload.description || '',
      razorpayLink: payload.razorpayLink,
      createdAt: new Date()
    };

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || 'ssi_portal');
    
    const result = await db.collection('courses').insertOne(newCourse);

    return new Response(JSON.stringify({ success: true, id: result.insertedId }), { status: 201 });
  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
