'use client';

import { useState } from 'react';
import { CheckCircle, Mail, AlertCircle, RefreshCw, RotateCcw } from 'lucide-react';
import { useModal } from '@/lib/contexts/ModalContext';

export default function SubmissionsTable({ initialSubmissions }) {
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [loadingAction, setLoadingAction] = useState(null);
  const { showAlert, showConfirm } = useModal();

  const handleAction = async (subId, action) => {
    if (action === 'reattempt') {
      const sub = submissions.find(s => s._id === subId);
      const confirmed = await showConfirm(
        'Allow Exam Retake',
        `Are you sure you want to cancel the passing evaluation and revoke any certificate for ${sub?.studentName || 'this student'}? This will unlock the exam so they can re-attempt it from their dashboard.`,
        'WARNING'
      );
      if (!confirmed) return;
    }

    setLoadingAction(`${action}-${subId}`);
    try {
      let endpoint;
      if (action === 'evaluate') endpoint = '/api/admin/submissions/evaluate';
      else if (action === 'issue') endpoint = '/api/admin/submissions/issue';
      else if (action === 'reset') endpoint = '/api/admin/submissions/reset';
      else if (action === 'reattempt') endpoint = '/api/admin/submissions/allow-reattempt';

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
          } else if (action === 'reattempt') {
             return { ...s, status: 'evaluated', passed: false, mailSent: false };
          }
        }
        return s;
      }));

      if (action === 'reattempt') {
        showAlert('Success', data.message || 'Exam unlocked for re-attempt successfully.', 'SUCCESS');
      }

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
                      background: evaluated 
                        ? (sub.passed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)') 
                        : 'rgba(245, 158, 11, 0.2)', 
                      color: evaluated 
                        ? (sub.passed ? 'var(--success)' : 'var(--danger)') 
                        : 'var(--accent)', 
                      padding: '0.2rem 0.5rem', 
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      fontWeight: 500
                    }}>
                      {evaluated ? (sub.passed ? 'PASSED' : 'NOT PASSED') : sub.status.toUpperCase()}
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <button 
                             className={`btn`}
                             style={{ 
                               padding: '0.4rem 0.8rem', 
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

                          {sub.passed && (
                            <button 
                               className="btn"
                               style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.3)', color: '#eab308', cursor: 'pointer' }}
                               onClick={() => handleAction(sub._id, 'reattempt')}
                               disabled={loadingAction === `reattempt-${sub._id}`}
                               title="Cancel pass and allow student to re-take exam"
                            >
                               {loadingAction === `reattempt-${sub._id}` ? <RefreshCw size={14} className="animate-spin" style={{ display: 'inline', marginRight: '4px' }} /> : <RotateCcw size={14} style={{ display: 'inline', marginRight: '4px' }} />}
                               Allow Retake
                            </button>
                          )}

                          <button 
                             className="btn"
                             style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: 'transparent', border: '1px solid var(--border)', color: 'var(--accent)', cursor: 'pointer' }}
                             onClick={() => handleAction(sub._id, 'reset')}
                             disabled={loadingAction === `reset-${sub._id}`}
                          >
                             {loadingAction === `reset-${sub._id}` ? '...' : (sub.passed ? 'Reissue' : 'Re-Evaluate')}
                          </button>
                        </div>
                      )}
                      {evaluated && sub.mailSent && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <span style={{ color: 'var(--success)', fontSize: '0.85rem' }}>✓ Email Sent</span>

                          {sub.passed && (
                            <button 
                               className="btn"
                               style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.3)', color: '#eab308', cursor: 'pointer' }}
                               onClick={() => handleAction(sub._id, 'reattempt')}
                               disabled={loadingAction === `reattempt-${sub._id}`}
                               title="Cancel pass and allow student to re-take exam"
                            >
                               {loadingAction === `reattempt-${sub._id}` ? <RefreshCw size={12} className="animate-spin" style={{ display: 'inline', marginRight: '3px' }} /> : <RotateCcw size={12} style={{ display: 'inline', marginRight: '3px' }} />}
                               Allow Retake
                            </button>
                          )}

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
