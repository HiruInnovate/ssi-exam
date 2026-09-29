import { requireAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import MobileHeader from '@/components/MobileHeader';
import StudentSidebar from '@/components/StudentSidebar';

export const metadata = {
  title: 'Student Dashboard | Study Smart Innovations',
};

export default async function StudentLayout({ children }) {
  const auth = await requireAuth(['student']);
  
  if (auth.error) {
    redirect('/');
  }

  // Check if first login requires password reset
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB_NAME || 'ssi_portal');
  const student = await db.collection('students').findOne({ _id: new ObjectId(auth.user.id) });

  if (student && !student.passwordChanged) {
    redirect('/change-password');
  }

  return (
    <div className="dashboard-layout">
      <StudentSidebar />
      <MobileHeader sidebar={StudentSidebar} />
      <main className="main-content mobile-padded">
        {children}
      </main>
    </div>
  );
}
