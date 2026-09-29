import clientPromise from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    const auth = await requireAuth(['student']);
    if (auth.error) {
      return new Response(JSON.stringify({ error: auth.error }), { status: auth.status });
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return new Response(JSON.stringify({ error: 'Both current and new passwords are required' }), { status: 400 });
    }

    if (newPassword.length < 6) {
      return new Response(JSON.stringify({ error: 'New password must be at least 6 characters long' }), { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || 'ssi_portal');

    const student = await db.collection('students').findOne({ _id: new ObjectId(auth.user.id) });
    if (!student) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

    const isMatch = await bcrypt.compare(currentPassword, student.password);
    if (!isMatch) {
      return new Response(JSON.stringify({ error: 'Incorrect current password' }), { status: 401 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.collection('students').updateOne(
      { _id: student._id },
      { $set: { password: hashedPassword, passwordChanged: true } }
    );

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (error) {
    console.error('Password Change Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}
