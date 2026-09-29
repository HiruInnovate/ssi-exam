import clientPromise from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function GET(req, { params }) {
  try {
    const auth = await requireAuth(['admin']);
    if (auth.error) return new Response(JSON.stringify({ error: auth.error }), { status: auth.status });

    const { id } = await params;
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || 'ssi_portal');
    
    const exam = await db.collection('exams').findOne({ _id: new ObjectId(id) });
    
    if (!exam) {
      return new Response(JSON.stringify({ error: 'Exam not found' }), { status: 404 });
    }

    return new Response(JSON.stringify(exam), { status: 200 });
  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const auth = await requireAuth(['admin']);
    if (auth.error) return new Response(JSON.stringify({ error: auth.error }), { status: auth.status });

    const { id } = await params;
    const payload = await req.json();

    if (!payload.title || !payload.batch || !payload.duration) {
       return new Response(JSON.stringify({ error: 'Missing basic exam configuration' }), { status: 400 });
    }

    const updatedExam = {
      title: payload.title,
      batch: payload.batch,
      duration: payload.duration,
      maxAttempts: parseInt(payload.maxAttempts) || 3,
      passingPercentage: parseFloat(payload.passingPercentage) || 50,
      rules: payload.rules || [],
      mcqs: payload.mcqs || [],
      codingQuestions: payload.codingQuestions || [],
      updatedAt: new Date()
    };

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || 'ssi_portal');
    
    const result = await db.collection('exams').updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedExam }
    );

    if (result.matchedCount === 0) {
      return new Response(JSON.stringify({ error: 'Exam not found' }), { status: 404 });
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
    
    const result = await db.collection('exams').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return new Response(JSON.stringify({ error: 'Exam not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
