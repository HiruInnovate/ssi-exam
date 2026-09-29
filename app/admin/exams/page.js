'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Edit, Trash2, Plus } from 'lucide-react';
import { useModal } from '@/lib/contexts/ModalContext';

export default function ExamsPage() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { showAlert, showConfirm } = useModal();

  const fetchExams = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/exams');
      if (!res.ok) throw new Error('Failed to fetch exams');
      const data = await res.json();
      setExams(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = await showConfirm(
      'Delete Exam Configuration', 
      'Are you sure you want to delete this exam configuration? All associated question mappings and batch settings will be removed. This action cannot be undone.', 
      'DANGER'
    );
    
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/exams/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete exam');
      }
      
      // Remove from state
      setExams(exams.filter(e => e._id !== id));
      showAlert('Deleted', 'The exam configuration has been successfully removed.', 'SUCCESS');
    } catch (err) {
      showAlert('Error', err.message, 'DANGER');
    }
  };

  if (loading) return <div className="container p-8 text-center">Loading exams...</div>;

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1 className="text-gradient">Exam Management</h1>
          <p className="hidden-mobile" style={{ color: 'var(--border)' }}>Create and configure exams for various batches.</p>
        </div>
        <Link href="/admin/exams/new" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
          <Plus size={18} />
          Create Exam
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)' }}>
          {error}
        </div>
      )}

      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '1rem' }}>Title</th>
              <th style={{ padding: '1rem' }}>Batch</th>
              <th style={{ padding: '1rem' }}>Duration</th>
              <th style={{ padding: '1rem' }}>Questions (MCQ/Coding)</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {exams.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--border)' }}>
                  No exams configured yet. Click 'Create Exam' to begin.
                </td>
              </tr>
            ) : (
              exams.map((exam) => (
                <tr key={exam._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem', fontWeight: 600 }}>{exam.title}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ background: 'var(--primary)', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }}>
                      {exam.batch}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>{exam.duration} mins</td>
                  <td style={{ padding: '1rem' }}>
                    {exam.mcqs?.length || 0} / {exam.codingQuestions?.length || 0}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <div className="flex flex-col items-end gap-2">
                      <Link 
                        href={`/admin/exams/${exam._id}/edit`} 
                        className="btn btn-secondary" 
                        style={{ padding: '0.4rem 0.8rem', minWidth: '80px', fontSize: '0.8rem' }}
                        title="Edit Exam"
                      >
                        <Edit size={14} />
                        <span>Edit</span>
                      </Link>
                      <button 
                        onClick={() => handleDelete(exam._id)}
                        className="btn btn-danger" 
                        style={{ padding: '0.4rem 0.8rem', minWidth: '80px', fontSize: '0.8rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                        title="Delete Exam"
                      >
                        <Trash2 size={14} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
