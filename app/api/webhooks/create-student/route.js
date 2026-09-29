import clientPromise from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    const authHeader = req.headers.get('authorization');
    const expectedSecret = process.env.EXAM_WEBHOOK_SECRET || 'my-exam-secret-key';
    
    if (authHeader !== `Bearer ${expectedSecret}`) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { name, email, phone, courseSlug } = await req.json();

    if (!name || !email) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || 'ssi_portal');

    const defaultPassword = process.env.STUDENT_DEFAULT_PASSWORD || 'student123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const lowerEmail = email.toLowerCase().trim();

    const student = await db.collection('students').findOne({ email: lowerEmail });

    // Map courseSlug to an exam batch if needed. We can just add the courseSlug as a batch.
    const batch = courseSlug ? [courseSlug] : [];
    
    if (!student) {
      const attempts = {};
      batch.forEach(b => attempts[b] = 3); // Grant 3 attempts by default for the new batch

      await db.collection('students').insertOne({
        name,
        email: lowerEmail,
        phone: phone || '',
        batch,
        password: hashedPassword,
        attempts,
        createdAt: new Date()
      });
      return new Response(JSON.stringify({ success: true, message: 'Student created' }), { status: 201 });
    } else {
      // Update existing student with new batch
      const newAttempts = {};
      batch.forEach(b => newAttempts[`attempts.${b}`] = 3);
      
      await db.collection('students').updateOne(
        { email: lowerEmail },
        { 
          $addToSet: { batch: { $each: batch } },
          $set: newAttempts
        }
      );
      return new Response(JSON.stringify({ success: true, message: 'Student updated' }), { status: 200 });
    }
  } catch (error) {
    console.error('Webhook Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
