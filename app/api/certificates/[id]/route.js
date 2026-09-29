import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { generateCertificateBuffer } from '@/lib/certificate';

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    if (!id) return new Response('Missing ID', { status: 400 });

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || 'ssi_portal');

    // Find submission
    const sub = await db.collection('submissions').findOne({ _id: new ObjectId(id) });
    if (!sub) {
      return new Response('Submission not found', { status: 404 });
    }

    if (!sub.passed || !sub.certId) {
      return new Response('Certificate not found or not issued for this submission', { status: 404 });
    }

    // Find student and exam details
    const student = await db.collection('students').findOne({ _id: sub.studentId });
    const exam = await db.collection('exams').findOne({ _id: sub.examId });

    if (!student || !exam) {
      return new Response('Associated student or exam data missing', { status: 404 });
    }

    // Format date - use stored certDate if available, otherwise fallback to now
    const d = sub.certDate ? new Date(sub.certDate) : new Date();
    const dateString = `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getFullYear())}`;

    // Generate buffer
    const buffer = await generateCertificateBuffer({
      studentName: student.name,
      certId: sub.certId,
      dateString,
      batchName: exam.batch
    });

    // Return the image
    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable', // Cache for SEO/performance
      },
    });

  } catch (error) {
    console.error('Certificate Serving Error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
