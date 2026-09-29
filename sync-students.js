import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

async function syncStudents() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    console.log("Connected to MongoDB.");

    const dbWorkflow = client.db('test'); // The default db used by course-workflow-agent
    const dbExam = client.db(process.env.MONGODB_DB_NAME || 'ssi_portal'); // Where exam portal data is

    const purchases = await dbWorkflow.collection('purchases').find({}).toArray();
    console.log(`Found ${purchases.length} purchases.`);

    const defaultPassword = process.env.STUDENT_DEFAULT_PASSWORD || 'student123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    let insertedCount = 0;
    let updatedCount = 0;

    for (const purchase of purchases) {
      if (!purchase.email || !purchase.courseSlug) continue;

      const email = purchase.email.toLowerCase().trim();
      const courseSlug = purchase.courseSlug;
      const batch = [courseSlug];

      const student = await dbExam.collection('students').findOne({ email });

      if (!student) {
        const attempts = {};
        attempts[courseSlug] = 3;

        await dbExam.collection('students').insertOne({
          name: purchase.name || purchase.email.split('@')[0],
          email,
          phone: purchase.phone || '',
          batch,
          password: hashedPassword,
          attempts,
          createdAt: new Date()
        });
        insertedCount++;
        console.log(`Inserted student: ${email} for course ${courseSlug}`);
      } else {
        // If student exists, update batch and attempts if not present
        const newAttempts = {};
        newAttempts[`attempts.${courseSlug}`] = 3;

        await dbExam.collection('students').updateOne(
          { email },
          { 
            $addToSet: { batch: courseSlug },
            $set: newAttempts
          }
        );
        updatedCount++;
        console.log(`Updated student: ${email} for course ${courseSlug}`);
      }
    }

    console.log(`Sync complete! Inserted: ${insertedCount}, Updated: ${updatedCount}`);
  } catch (error) {
    console.error("Error syncing students:", error);
  } finally {
    await client.close();
  }
}

syncStudents();
