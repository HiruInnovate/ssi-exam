import clientPromise from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import { ObjectId } from 'mongodb';
import ShareButtons from '@/components/ShareButtons';

export default async function ResultsHistoryPage() {
  const auth = await requireAuth(['student']);
  if (auth.error) return null;

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB_NAME || 'ssi_portal');

  const submissions = await db.collection('submissions').find({ 
    studentId: new ObjectId(auth.user.id) 
  }).sort({ submittedAt: -1 }).toArray();

  return (
    <div>
      <h1 className="text-gradient">Results & Certificates</h1>
      <p style={{ color: 'var(--border)', marginBottom: '2rem' }}>View your past examination scores and download certificates.</p>

      {submissions.length === 0 ? (
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--border)' }}>
          You haven't submitted any exams yet.
        </div>
      ) : (
        <div className="glass-panel" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '1rem' }}>Exam Name</th>
                <th style={{ padding: '1rem' }}>Submitted On</th>
                <th style={{ padding: '1rem' }}>Status</th>
                <th style={{ padding: '1rem' }}>Score</th>
                <th style={{ padding: '1rem' }}>Certificate</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub) => (
                <tr key={sub._id.toString()} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem' }}>{sub.examTitle || 'Pending Evaluator Update'}</td>
                  <td style={{ padding: '1rem' }}>{new Date(sub.submittedAt).toLocaleDateString('en-GB')}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      background: sub.status === 'evaluated' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)', 
                      color: sub.status === 'evaluated' ? 'var(--success)' : 'var(--accent)', 
                      padding: '0.2rem 0.5rem', 
                      borderRadius: '4px',
                      fontSize: '0.8rem'
                    }}>
                      {sub.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>{sub.status === 'evaluated' ? `${sub.score}%` : '-'}</td>
                  <td style={{ padding: '1rem' }}>
                     {sub.status === 'evaluated' && sub.passed ? (
                       <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                         <a href={sub.certificateUrl} download target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ textDecoration: 'none', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Download</a>
                         <ShareButtons examTitle={sub.examTitle} certificateUrl={sub.certificateUrl} />
                       </div>
                     ) : (
                       <span style={{ color: 'var(--border)' }}>N/A</span>
                     )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
