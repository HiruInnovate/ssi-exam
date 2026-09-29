import clientPromise from '@/lib/mongodb';
import { Users, BookOpen, CheckCircle, Clock } from 'lucide-react';
import ActivityLog from './ActivityLog';

export default async function AdminDashboardOverview() {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB_NAME || 'ssi_portal');

  const studentsCount = await db.collection('students').countDocuments();
  const examsCount = await db.collection('exams').countDocuments();
  const submissionsCount = await db.collection('submissions').countDocuments();
  
  // Example dummy data for stats
  const stats = [
    { label: 'Total Students', value: studentsCount, icon: Users, color: 'var(--primary)' },
    { label: 'Active Exams', value: examsCount, icon: BookOpen, color: 'var(--accent)' },
    { label: 'Evaluated Submissions', value: submissionsCount, icon: CheckCircle, color: 'var(--success)' },
    { label: 'Pending Midnight Batch', value: 0, icon: Clock, color: 'var(--danger)' },
  ];

  return (
    <div>
      <h1 className="text-gradient">Dashboard Overview</h1>
      <p style={{ color: 'var(--border)', marginBottom: '2rem' }}>Welcome to the Study Smart Innovations Admin Portal.</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ background: `${stat.color}20`, color: stat.color, padding: '1rem', borderRadius: '50%' }}>
                <Icon size={28} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.75rem', margin: 0, lineHeight: 1 }}>{stat.value}</h3>
                <p style={{ color: 'var(--border)', fontSize: '0.875rem' }}>{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <ActivityLog />
    </div>
  );
}
