import { requireAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export const metadata = {
  title: 'Exam Portal | Study Smart Innovations',
};

export default async function ExamLayout({ children }) {
  const auth = await requireAuth(['student']);
  
  if (auth.error) {
    redirect('/');
  }

  // Enforce password change
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB_NAME || 'ssi_portal');
  const student = await db.collection('students').findOne({ _id: new ObjectId(auth.user.id) });

  if (student && !student.passwordChanged) {
    redirect('/change-password');
  }

  return <>{children}</>;
}
