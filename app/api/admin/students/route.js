import clientPromise from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function GET(req) {
  try {
    const auth = await requireAuth(['admin']);
    if (auth.error) return new Response(JSON.stringify({ error: auth.error }), { status: auth.status });

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || 'ssi_portal');
    
    const students = await db.collection('students').find({}).sort({ _id: -1 }).toArray();

    return new Response(JSON.stringify(students), { status: 200 });
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
    const studentsArr = payload.students || [];
    const batch = payload.batch || [];

    if (studentsArr.length === 0 || !Array.isArray(batch) || batch.length === 0) {
       return new Response(JSON.stringify({ error: 'Missing required fields or empty students array' }), { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || 'ssi_portal');

    const defaultPassword = process.env.STUDENT_DEFAULT_PASSWORD || 'student123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const attempts = {};
    batch.forEach(b => attempts[b] = 3);

    // Filter out existing emails efficiently (case-insensitive)
    const emailsToImport = studentsArr.map(s => s.email?.toLowerCase().trim()).filter(Boolean);
    const existingDocs = await db.collection('students').find({ email: { $in: emailsToImport } }).toArray();
    const existingDocMap = new Map(existingDocs.map(d => [d.email.toLowerCase(), d]));

    const newDocuments = [];
    const bulkOps = [];
    let insertedCount = 0;
    let updatedCount = 0;

    for (const s of studentsArr) {
      if (!s.name || !s.email || !s.phone) continue;
      const lowerEmail = s.email.toLowerCase().trim();

      if (!existingDocMap.has(lowerEmail)) {
         newDocuments.push({
           name: s.name,
           email: lowerEmail,
           phone: s.phone,
           batch,
           password: hashedPassword,
           attempts,
           createdAt: new Date()
         });
         // Add to map to prevent duplicates within the imported file itself
         existingDocMap.set(lowerEmail, { email: lowerEmail });
      } else {
         // User already exists! Append the new batches and grant attempts.
         const newAttempts = {};
         batch.forEach(b => newAttempts[`attempts.${b}`] = 3);
         
         bulkOps.push({
           updateOne: {
             filter: { email: lowerEmail },
             update: { 
               $addToSet: { batch: { $each: batch } },
               $set: newAttempts
             }
           }
         });
         // Also prevent duplicating the update if the file has duplicate emails
         existingDocMap.set(lowerEmail, { email: lowerEmail });
      }
    }

    if (newDocuments.length > 0) {
       const result = await db.collection('students').insertMany(newDocuments, { ordered: false });
       insertedCount = result.insertedCount;
    }

    if (bulkOps.length > 0) {
       const bulkResult = await db.collection('students').bulkWrite(bulkOps, { ordered: false });
       updatedCount = bulkResult.modifiedCount;
    }

    if (insertedCount === 0 && updatedCount === 0 && studentsArr.length > 0) {
       return new Response(JSON.stringify({ error: 'Data conflict: Details could not be inserted or updated.' }), { status: 409 });
    }

    return new Response(JSON.stringify({ success: true, insertedCount, updatedCount }), { status: 201 });
  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
