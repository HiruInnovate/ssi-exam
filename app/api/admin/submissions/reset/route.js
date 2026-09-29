import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import fs from 'fs';
import path from 'path';
import { requireAuth } from '@/lib/auth';

export async function POST(req) {
  try {
    const auth = await requireAuth(['admin']);
    if (auth.error) {
      return new Response(JSON.stringify({ error: auth.error }), { status: auth.status });
    }

    const { submissionId } = await req.json();
    if (!submissionId) return new Response(JSON.stringify({ error: 'Missing submissionId' }), { status: 400 });

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || 'ssi_portal');

    const sub = await db.collection('submissions').findOne({ _id: new ObjectId(submissionId) });
    if (!sub) return new Response(JSON.stringify({ error: 'Submission not found' }), { status: 404 });

    // No longer deleting file from disk as certificates are dynamically generated
    // and not stored in the public/certs directory anymore.

    // Reset submission state
    await db.collection('submissions').updateOne(
      { _id: sub._id },
      { $set: { status: 'pending', certId: null, certificateUrl: null, mailSent: false } }
    );

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (error) {
    console.error('Reset API Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
