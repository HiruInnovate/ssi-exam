import clientPromise from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function PUT(req, { params }) {
  try {
    const auth = await requireAuth(['admin']);
    if (auth.error) return new Response(JSON.stringify({ error: auth.error }), { status: auth.status });

    const payload = await req.json();
    const { id } = await params;

    if (!payload.title || !payload.razorpayLink) {
       return new Response(JSON.stringify({ error: 'Missing title or razorpayLink' }), { status: 400 });
    }

    const updateData = {
      title: payload.title,
      description: payload.description || '',
      razorpayLink: payload.razorpayLink,
      updatedAt: new Date()
    };

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || 'ssi_portal');
    
    const result = await db.collection('courses').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
        return new Response(JSON.stringify({ error: 'Course not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const auth = await requireAuth(['admin']);
    if (auth.error) return new Response(JSON.stringify({ error: auth.error }), { status: auth.status });

    const { id } = await params;

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || 'ssi_portal');
    
    const result = await db.collection('courses').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
        return new Response(JSON.stringify({ error: 'Course not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
