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

    // Fetch the exam but REMOVE answers for MCQs + Coding Sample Answers
    const exam = await db.collection('exams').findOne({ _id: new ObjectId(examId) });
    if (!exam) return new Response(JSON.stringify({ error: 'Exam not found' }), { status: 404 });

    const sanitizedMcqs = exam.mcqs?.map(q => ({
      id: q.id,
      question: q.question,
      options: q.options
    })) || [];

    const sanitizedCoding = exam.codingQuestions?.map(q => ({
      id: q.id,
      question: q.question
    })) || [];

    const sanitizedExam = {
      title: exam.title,
      duration: exam.duration,
      mcqs: sanitizedMcqs,
      codingQuestions: sanitizedCoding
    };

    return new Response(JSON.stringify({ exam: sanitizedExam }), { status: 200 });
  } catch (error) {
    console.error('Play Data Fetch Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
