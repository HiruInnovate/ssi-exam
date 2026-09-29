import clientPromise from '@/lib/mongodb';
import SubmissionsTable from './SubmissionsTable';

export default async function AdminSubmissionsPage() {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB_NAME || 'ssi_portal');
  
  // Fetch all submissions, join with students and exams
  const rawSubmissions = await db.collection('submissions').aggregate([
    {
      $lookup: {
        from: 'students',
        localField: 'studentId',
        foreignField: '_id',
        as: 'student'
      }
    },
    { $unwind: { path: '$student', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'exams',
        localField: 'examId',
        foreignField: '_id',
        as: 'exam'
      }
    },
    { $unwind: { path: '$exam', preserveNullAndEmptyArrays: true } },
    { $sort: { submittedAt: -1 } }
  ]).toArray();

  // Serialize objects for client component
  const submissions = rawSubmissions.map(sub => ({
    _id: sub._id.toString(),
    status: sub.status || 'pending',
    score: sub.score ?? null,
    passed: sub.passed ?? null,
    mailSent: sub.mailSent ?? false,
    submittedAt: sub.submittedAt || new Date(),
    examTitle: sub.examTitle || sub.exam?.title || 'Unknown Exam',
    studentName: sub.student?.name || 'Unknown Student',
    studentEmail: sub.student?.email || 'No email'
  }));

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-gradient">Manual Evaluations</h1>
          <p style={{ color: 'var(--border)' }}>Evaluate pending submissions and issue certificates.</p>
        </div>
      </div>
      
      <SubmissionsTable initialSubmissions={submissions} />
    </div>
  );
}
