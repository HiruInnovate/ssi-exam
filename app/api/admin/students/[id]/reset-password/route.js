import clientPromise from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';

export async function PUT(req, { params }) {
  try {
    const auth = await requireAuth(['admin']);
    if (auth.error) return new Response(JSON.stringify({ error: auth.error }), { status: auth.status });

    const { id } = await params;
    
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || 'ssi_portal');
    
    const defaultPassword = process.env.STUDENT_DEFAULT_PASSWORD || 'student123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    
    const result = await db.collection('students').updateOne(
      { _id: new ObjectId(id) },
      { $set: { password: hashedPassword, passwordChanged: false } }
    );

    if (result.matchedCount === 0) {
      return new Response(JSON.stringify({ error: 'Student not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ success: true, message: 'Password reset successfully' }), { status: 200 });
  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
