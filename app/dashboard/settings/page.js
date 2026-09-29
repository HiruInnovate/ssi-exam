import { requireAuth } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import SettingsForm from './SettingsForm';

export const metadata = {
  title: 'Account Settings | SSI Portal',
};

export default async function SettingsPage() {
  const auth = await requireAuth(['student']);
  if (auth.error) return null;

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB_NAME || 'ssi_portal');
  const student = await db.collection('students').findOne({ _id: new ObjectId(auth.user.id) });

  if (!student) return <div>Student not found</div>;

  const initialData = {
    name: student.name,
    email: student.email,
    phone: student.phone
  };

  return (
    <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <div className="flex flex-col gap-8">
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Settings</h1>
          <p style={{ opacity: 0.7 }}>Manage your profile information and account security.</p>
        </div>

        <SettingsForm initialData={initialData} />
      </div>
    </div>
  );
}
