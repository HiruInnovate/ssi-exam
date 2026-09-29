import clientPromise from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import { ObjectId } from 'mongodb';
import Link from 'next/link';
import ShareButtons from '@/components/ShareButtons';

export default async function StudentDashboardOverview() {
  const auth = await requireAuth(['student']);
  if (auth.error) return null; // Handled by layout redirect

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB_NAME || 'ssi_portal');

  // Fetch full student info to get their batches and attempts
  const student = await db.collection('students').findOne({ _id: new ObjectId(auth.user.id) });

  if (!student || !student.batch) {
     return <div>No courses enrolled. Contact Administrator.</div>;
  }

  // Find exams that match student batches
  const availableExams = await db.collection('exams').find({
    batch: { $in: student.batch }
  }).toArray();

  // Fetch active announcements
  const announcements = await db.collection('announcements').find({ isActive: true }).sort({ _id: -1 }).toArray();

  // Fetch student's submissions to count attempts
  const submissions = await db.collection('submissions').find({
    studentId: new ObjectId(auth.user.id)
  }).toArray();

  return (
    <div>
      {announcements.length > 0 && (
        <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {announcements.map(ann => (
            <div key={ann._id.toString()} style={{ background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))', border: '1px solid var(--primary)', borderRadius: '8px', padding: '1rem 1.5rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--primary)' }} />
              <h3 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span role="img" aria-label="announcement">📢</span> {ann.title}
              </h3>
              <p style={{ margin: 0, opacity: 0.9, whiteSpace: 'pre-wrap' }}>{ann.message}</p>
            </div>
          ))}
        </div>
      )}

      <h1 className="text-gradient">Welcome, {student.name}</h1>
      <p style={{ color: 'var(--border)', marginBottom: '2rem' }}>Ready to take your exams and get certified?</p>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ margin: 0 }}>Available Exams</h2>
        <Link href="/dashboard/courses" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
          Explore Other Courses
        </Link>
      </div>
      
      {availableExams.length === 0 ? (
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--border)' }}>
          No exams currently assigned to your enrolled courses.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {availableExams.map(exam => {
            const examSubmissions = submissions.filter(s => s.examId.toString() === exam._id.toString());
            const usedAttempts = examSubmissions.length;
            const maxAttempts = exam.maxAttempts || 3;
            
            const passedSubmission = examSubmissions.find(s => s.passed);
            
            const attemptsLeft = passedSubmission ? 0 : Math.max(0, maxAttempts - usedAttempts);
            const hasAttempts = attemptsLeft > 0;

            return (
              <div key={exam._id.toString()} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                <h3 className="mb-2">{exam.title}</h3>
                <div className="flex gap-2 mb-4">
                   <span style={{ fontSize: '0.8rem', background: 'rgba(59, 130, 246, 0.2)', color: 'var(--primary)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{exam.batch}</span>
                   <span style={{ fontSize: '0.8rem', background: 'rgba(255, 255, 255, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{exam.duration} mins</span>
                </div>
                
                <p style={{ fontSize: '0.9rem', color: 'var(--border)', marginBottom: '1.5rem', flex: 1 }}>
                  {passedSubmission ? (
                     <strong style={{ color: 'var(--success)' }}>Status: Course Completed & Passed!</strong>
                  ) : (
                     <>Attempts Remaining: <strong style={{ color: hasAttempts ? 'var(--success)' : 'var(--danger)' }}>{attemptsLeft} / {maxAttempts}</strong></>
                  )}
                </p>

                {passedSubmission && passedSubmission.certificateUrl ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <a 
                      href={passedSubmission.certificateUrl} 
                      download={`Certificate_${exam.batch.replace(/\\s+/g, '_')}.png`} 
                      className="btn btn-success" 
                      style={{ width: '100%', textAlign: 'center', textDecoration: 'none' }}
                    >
                      🏆 Download Certificate
                    </a>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <ShareButtons examTitle={exam.title} certificateUrl={passedSubmission.certificateUrl} />
                    </div>
                  </div>
                ) : hasAttempts ? (
                  <Link href={`/exam/start/${exam._id}`} className="btn btn-primary" style={{ width: '100%', textAlign: 'center' }}>
                    Go to Exam Area
                  </Link>
                ) : (
                  <button className="btn btn-secondary" disabled style={{ width: '100%', opacity: 0.5 }}>
                    {passedSubmission ? 'Certificate Processing...' : 'Maximum Attempts Reached'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
