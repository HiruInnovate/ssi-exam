import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function POST(req) {
  try {
    const auth = await requireAuth(['student']);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { name, phone } = await req.json();

    if (!name || !phone) {
      return NextResponse.json({ error: 'Name and Phone are required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || 'ssi_portal');
    
    await db.collection('students').updateOne(
      { _id: new ObjectId(auth.user.id) },
      { $set: { name, phone } }
    );

    return NextResponse.json({ success: true, message: 'Profile updated successfully' });
  } catch (err) {
    console.error('Profile Update Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
