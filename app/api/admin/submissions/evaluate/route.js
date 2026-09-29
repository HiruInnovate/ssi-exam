import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import sharp from 'sharp';
import { requireAuth } from '@/lib/auth';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const maxDuration = 60;

export async function POST(req) {
  try {
    const auth = await requireAuth(['admin']);
    if (auth.error) {
      return new Response(JSON.stringify({ error: auth.error }), { status: auth.status });
    }

    const { submissionId } = await req.json();
    if (!submissionId) {
      return new Response(JSON.stringify({ error: 'Missing submissionId' }), { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || 'ssi_portal');

    const sub = await db.collection('submissions').findOne({ _id: new ObjectId(submissionId) });
    if (!sub) {
      return new Response(JSON.stringify({ error: 'Submission not found' }), { status: 404 });
    }

    if (sub.status === 'evaluated') {
      return new Response(JSON.stringify({ error: 'Already evaluated' }), { status: 400 });
    }

    const exam = await db.collection('exams').findOne({ _id: sub.examId });
    const student = await db.collection('students').findOne({ _id: sub.studentId });

    if (!exam || !student) {
      await db.collection('submissions').updateOne({ _id: sub._id }, { $set: { status: 'failed_missing_data' } });
      return new Response(JSON.stringify({ error: 'Orphaned submission data' }), { status: 400 });
    }

    let totalScore = 0;
    let maxPossibleScore = 0;

    // Evaluate MCQs
    if (exam.mcqs && exam.mcqs.length > 0) {
      for (const mcq of exam.mcqs) {
        const mcqMarks = mcq.marks || 1;
        maxPossibleScore += mcqMarks;

        const studentAns = sub.mcqAnswers?.[mcq.id];
        if (studentAns !== undefined && studentAns === mcq.answer) {
          totalScore += mcqMarks;
        }
      }
    }

    // Evaluate Coding Questions via OpenAI
    if (exam.codingQuestions && exam.codingQuestions.length > 0 && process.env.OPENAI_API_KEY) {
      for (const cq of exam.codingQuestions) {
        const cqMarks = cq.marks || 5;
        maxPossibleScore += cqMarks;

        const studentCode = sub.codingAnswers?.[cq.id];
        if (!studentCode || studentCode.trim() === '') continue;

        const prompt = `You are an expert ${exam.batch} programming evaluator.
          Question: ${cq.question}
          Reference Correct Logic: ${cq.sampleAnswer}
          Student Answer: ${studentCode}
          Evaluate the student's answer. It DOES NOT need to strictly match the reference answer. 
          As long as the student's code logically solves the problem, fulfills the requirements, and has correct syntax (even with a different valid approach), consider it correct.
          Does the student's code correctly solve the problem?
          Strictly answer ONLY with "YES" or "NO".`;

        try {
          const aiResponse = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 10,
            temperature: 0.1
          });

          const result = aiResponse.choices[0].message.content.trim().toUpperCase();
          if (result.includes('YES')) {
            totalScore += cqMarks;
          }
        } catch (aiErr) {
          console.error('OpenAI eval err:', aiErr);
        }
      }
    }

    const percentageScore = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;

    const passThreshold = exam.passingPercentage !== undefined ? parseFloat(exam.passingPercentage) : 50;
    const passed = percentageScore >= passThreshold;
    const certId = crypto.randomBytes(8).toString('hex').toUpperCase();
    let certificateUrl = null;

    if (passed) {
      // Use dynamic URL for certificate - served via /api/certificates/[id]
      // No longer saving to public/certs to avoid Read-only file system errors on Vercel
      certificateUrl = `/api/certificates/${sub._id.toString()}`;
    }

    // Update DB
    await db.collection('submissions').updateOne(
      { _id: sub._id },
      {
        $set: {
          status: 'evaluated',
          score: percentageScore,
          passed,
          certId: passed ? certId : null,
          certDate: passed ? new Date() : null,
          certificateUrl,
          mailSent: false // flag for next step
        }
      }
    );

    return new Response(JSON.stringify({
      success: true,
      passed,
      score: percentageScore,
      certificateUrl
    }), { status: 200 });

  } catch (error) {
    console.error('Evaluate API Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
