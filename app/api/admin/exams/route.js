import clientPromise from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';

export async function GET(req) {
  try {
    const auth = await requireAuth(['admin']);
    if (auth.error) return new Response(JSON.stringify({ error: auth.error }), { status: auth.status });

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || 'ssi_portal');
    
    const exams = await db.collection('exams').find({}).sort({ _id: -1 }).toArray();

    return new Response(JSON.stringify(exams), { status: 200 });
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

    if (!payload.title || !payload.batch || !payload.duration) {
       return new Response(JSON.stringify({ error: 'Missing basic exam configuration' }), { status: 400 });
    }

    const newExam = {
      title: payload.title,
      batch: payload.batch,
      duration: payload.duration,
      maxAttempts: parseInt(payload.maxAttempts) || 3,
      passingPercentage: parseFloat(payload.passingPercentage) || 50,
      rules: payload.rules || [],
      mcqs: payload.mcqs || [],
      codingQuestions: payload.codingQuestions || [],
      createdAt: new Date()
    };

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || 'ssi_portal');
    
    const result = await db.collection('exams').insertOne(newExam);

    return new Response(JSON.stringify({ success: true, id: result.insertedId }), { status: 201 });
  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
