'use client';

import { useState } from 'react';
import { CheckCircle, Mail, AlertCircle, RefreshCw } from 'lucide-react';
import { useModal } from '@/lib/contexts/ModalContext';

export default function SubmissionsTable({ initialSubmissions }) {
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [loadingAction, setLoadingAction] = useState(null);
  const { showAlert } = useModal();

  const handleAction = async (subId, action) => {
    setLoadingAction(`${action}-${subId}`);
    try {
      let endpoint;
      if (action === 'evaluate') endpoint = '/api/admin/submissions/evaluate';
      else if (action === 'issue') endpoint = '/api/admin/submissions/issue';
      else if (action === 'reset') endpoint = '/api/admin/submissions/reset';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId: subId })
      });

      if (!res.ok) {
        const error = await res.json();
        showAlert('Error', error.error || error.message || 'Operation failed', 'DANGER');
        return;
      }

      const data = await res.json();
      
      // Update local state
      setSubmissions(prev => prev.map(s => {
        if (s._id === subId) {
          if (action === 'evaluate') {
             return { ...s, status: 'evaluated', passed: data.passed, score: data.score };
          } else if (action === 'issue') {
             return { ...s, mailSent: true };
          } else if (action === 'reset') {
             return { ...s, status: 'pending', passed: null, score: null, mailSent: false };
          }
        }
        return s;
      }));

    } catch (err) {
      showAlert('Error', err.message, 'DANGER');
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="glass-panel" style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            <th style={{ padding: '1rem' }}>Student</th>
            <th style={{ padding: '1rem' }}>Exam</th>
            <th style={{ padding: '1rem' }}>Submitted At</th>
            <th style={{ padding: '1rem' }}>Status</th>
            <th style={{ padding: '1rem' }}>Score</th>
            <th style={{ padding: '1rem' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {submissions.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--border)' }}>
                No submissions found.
              </td>
            </tr>
          ) : (
            submissions.map((sub) => {
              const pending = sub.status === 'pending';
              const evaluated = sub.status === 'evaluated';
              
              return (
                <tr key={sub._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem' }}>
                     <div>{sub.studentName}</div>
                     <div style={{ fontSize: '0.8rem', color: 'var(--border)' }}>{sub.studentEmail}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>{sub.examTitle}</td>
                  <td style={{ padding: '1rem' }}>
                    {new Date(sub.submittedAt).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      background: evaluated ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)', 
                      color: evaluated ? 'var(--success)' : 'var(--accent)', 
                      padding: '0.2rem 0.5rem', 
                      borderRadius: '4px',
                      fontSize: '0.8rem'
                    }}>
                      {sub.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {evaluated ? (
                      <span style={{ color: sub.passed ? 'var(--success)' : 'var(--danger)', fontWeight: 'bold' }}>
                        {sub.score}%
                      </span>
                    ) : '-'}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ minHeight: '32px' }}>
                      {pending && (
                        <button 
                          className="btn btn-primary" 
                          style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', cursor: 'pointer' }}
                          onClick={() => handleAction(sub._id, 'evaluate')}
                          disabled={loadingAction === `evaluate-${sub._id}`}
                        >
                           {loadingAction === `evaluate-${sub._id}` ? <RefreshCw size={14} className="animate-spin" style={{ display: 'inline', marginRight: '4px' }} /> : <CheckCircle size={14} style={{ display: 'inline', marginRight: '4px' }}/>}
                           Evaluate
                        </button>
                      )}
                      {evaluated && !sub.mailSent && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <button 
                             className={`btn`}
                             style={{ 
                               padding: '0.4rem 1rem', 
                               fontSize: '0.8rem', 
                               background: sub.passed ? 'var(--success)' : 'transparent', 
                               border: sub.passed ? 'none' : '1px solid var(--border)',
                               color: 'white',
                               cursor: 'pointer'
                             }}
                             onClick={() => handleAction(sub._id, 'issue')}
                             disabled={loadingAction === `issue-${sub._id}`}
                          >
                             {loadingAction === `issue-${sub._id}` ? <RefreshCw size={14} className="animate-spin" style={{ display: 'inline', marginRight: '4px' }} /> : (sub.passed ? <Mail size={14} style={{ display: 'inline', marginRight: '4px' }}/> : <AlertCircle size={14} style={{ display: 'inline', marginRight: '4px' }}/>)}
                             {sub.passed ? 'Issue Certificate' : 'Notify Failure'}
                          </button>
                          <button 
                             className="btn"
                             style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', background: 'transparent', border: '1px solid var(--border)', color: 'var(--accent)', cursor: 'pointer' }}
                             onClick={() => handleAction(sub._id, 'reset')}
                             disabled={loadingAction === `reset-${sub._id}`}
                          >
                             {loadingAction === `reset-${sub._id}` ? '...' : (sub.passed ? 'Reissue' : 'Re-Evaluate')}
                          </button>
                        </div>
                      )}
                      {evaluated && sub.mailSent && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ color: 'var(--success)', fontSize: '0.85rem' }}>✓ Email Sent</span>
                          <button 
                             className="btn"
                             style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', background: 'transparent', border: '1px solid var(--border)', color: 'var(--accent)', cursor: 'pointer' }}
                             onClick={() => handleAction(sub._id, 'reset')}
                             disabled={loadingAction === `reset-${sub._id}`}
                          >
                             {loadingAction === `reset-${sub._id}` ? '...' : 'Reissue'}
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
