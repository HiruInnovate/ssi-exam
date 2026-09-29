'use client';

import { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle, Play, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { useModal } from '@/lib/contexts/ModalContext';

export default function ActivityLog() {
  const [activities, setActivities] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [deleting, setDeleting] = useState(false);
  const { showAlert, showConfirm } = useModal();

  const fetchActivities = async (page = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/activities?page=${page}&limit=10`);
      const data = await res.json();
      if (res.ok) {
        setActivities(data.activities);
        setPagination(data.pagination);
        setSelectedIds(new Set()); // Reset selection on page change
      }
    } catch (err) {
      console.error('Failed to fetch activities:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const handleSelectPage = (checked) => {
    if (checked) {
      setSelectedIds(new Set(activities.map(a => a._id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    
    const confirmed = await showConfirm(
      'Confirm Deletion', 
      `Are you sure you want to delete ${selectedIds.size} activity logs? This action is permanent and cannot be undone.`,
      'DANGER'
    );

    if (!confirmed) return;

    setDeleting(true);
    try {
      const res = await fetch('/api/admin/activities/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedIds) })
      });

      if (res.ok) {
        // Refresh
        fetchActivities(pagination.page);
      } else {
        const error = await res.json();
        showAlert('Error', `Failed to delete: ${error.error}`, 'DANGER');
      }
    } catch (err) {
      showAlert('Error', `Delete error: ${err.message}`, 'DANGER');
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    fetchActivities(pagination.page);
  }, [pagination.page]);

  const getIcon = (type) => {
    switch (type) {
      case 'STARTED': return <Play size={16} style={{ color: '#f59e0b' }} />; // Yellow
      case 'TAB_SWITCH':
      case 'FOCUS_LOST':
      case 'CAMERA_FAIL':
      case 'VIOLATION_WARNING':
      case 'VIOLATION_CRITICAL':
      case 'DISQUALIFIED': return <AlertTriangle size={16} style={{ color: '#ef4444' }} />; // Red
      case 'SUBMITTED': return <CheckCircle size={16} style={{ color: '#10b981' }} />; // Green
      default: return <Clock size={16} className="text-border" />;
    }
  };

  const getTypeStyles = (type) => {
    switch (type) {
      case 'STARTED': return { borderLeft: '4px solid #f59e0b', color: '#f59e0b' };
      case 'TAB_SWITCH':
      case 'FOCUS_LOST':
      case 'CAMERA_FAIL':
      case 'VIOLATION_WARNING': return { borderLeft: '4px solid #ef4444', color: '#ef4444' };
      case 'VIOLATION_CRITICAL':
      case 'DISQUALIFIED': return { borderLeft: '4px solid #b91c1c', color: '#b91c1c' };
      case 'SUBMITTED': return { borderLeft: '4px solid #10b981', color: '#10b981' };
      default: return { borderLeft: '4px solid var(--border)', color: 'var(--primary)' };
    }
  };

  const formatDateTime = (ts) => {
    const d = new Date(ts);
    const date = d.toLocaleDateString('en-GB');
    const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    return { date, time };
  };

  return (
    <div className="activity-container glass-panel">
      <div className="activity-header">
        <div>
          <h3 className="mb-2">Recent Activity & Audit Trail</h3>
          <div className="flex items-center gap-4">
             <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer', color: 'var(--border)' }}>
               <input 
                 type="checkbox" 
                 style={{ width: 'auto' }} 
                 checked={activities.length > 0 && selectedIds.size === activities.length} 
                 onChange={(e) => handleSelectPage(e.target.checked)} 
               />
               Select All on Page
             </label>
             {selectedIds.size > 0 && (
               <button 
                 onClick={handleDeleteSelected} 
                 className="btn btn-danger" 
                 style={{ 
                   padding: '0.4rem 0.8rem', 
                   fontSize: '0.8rem', 
                   marginLeft: '0.5rem',
                   display: 'flex',
                   alignItems: 'center',
                   gap: '0.4rem'
                 }}
                 disabled={deleting}
               >
                 {deleting ? 'Deleting...' : `Delete ${selectedIds.size} selected`}
               </button>
             )}
          </div>
        </div>
        <button className="btn btn-secondary" onClick={() => fetchActivities(pagination.page)} disabled={loading} style={{ padding: '0.4rem', marginTop: '-0.2rem' }}>
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div style={{ flex: 1 }}>
        {loading ? (
          <div className="text-center p-8">Loading audit logs...</div>
        ) : activities.length === 0 ? (
          <div className="text-center p-8 text-border">No activity logs found.</div>
        ) : (
          <div className="flex flex-col gap-4">
            {activities.map((activity, idx) => {
              const { date, time } = formatDateTime(activity.timestamp);
              const customStyles = getTypeStyles(activity.type);
              const isSelected = selectedIds.has(activity._id);
              
              const borderColor = isSelected ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.05)';

              return (
                <div key={activity._id || idx} className={`activity-row ${isSelected ? 'selected' : ''}`} style={customStyles}>
                  <div className="flex items-center gap-4">
                    <input 
                      type="checkbox" 
                      style={{ width: 'auto' }} 
                      checked={isSelected} 
                      onChange={() => handleSelectOne(activity._id)} 
                    />
                    
                    <div className="icon-wrapper">
                      {getIcon(activity.type)}
                    </div>
                  </div>
                  
                  <div className="activity-info">
                    <div className="activity-title">
                      <span style={{ color: customStyles.color }}>{activity.studentName}</span> 
                      <span className="student-email">
                        ({activity.studentEmail})
                      </span>
                      {activity.type === 'STARTED' && ' started '}
                      {(activity.type === 'TAB_SWITCH' || activity.type === 'FOCUS_LOST' || activity.type === 'CAMERA_FAIL' || activity.type === 'VIOLATION_WARNING' || activity.type === 'VIOLATION_CRITICAL') && ' triggered a warning during '}
                      {activity.type === 'DISQUALIFIED' && ' was disqualified from '}
                      {activity.type === 'SUBMITTED' && ' submitted '}
                      <span className="exam-tag">{activity.examTitle}</span>
                    </div>
                    <div className="activity-msg">
                      {activity.message}
                    </div>
                  </div>
                  <div className="activity-timestamp">
                    <div className="time">{time}</div>
                    <div className="date">{date}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {pagination.pages > 1 && (
        <div className="mt-6 flex justify-center items-center gap-4">
          <button 
            className="btn btn-secondary" 
            disabled={pagination.page === 1 || loading}
            onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
            style={{ padding: '0.5rem' }}
          >
            <ChevronLeft size={18} />
          </button>
          <span style={{ fontSize: '0.9rem', color: 'var(--border)' }}>
            Page {pagination.page} of {pagination.pages}
          </span>
          <button 
            className="btn btn-secondary" 
            disabled={pagination.page === pagination.pages || loading}
            onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
            style={{ padding: '0.5rem' }}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
      <style jsx>{`
        .activity-container {
          margin-top: 2rem;
          padding: 1.5rem;
          min-height: 400px;
          display: flex;
          flex-direction: column;
        }
        .activity-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
        }
        .refresh-btn {
          background: var(--secondary);
          border: 1px solid var(--border);
          color: white;
          padding: 0.4rem;
          border-radius: var(--radius-sm);
          cursor: pointer;
        }
        .activity-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: var(--radius-md);
          margin-bottom: 0.5rem;
          transition: background 0.2s ease;
        }
        .activity-row.selected {
          background: rgba(239, 68, 68, 0.05);
          border-color: rgba(239, 68, 68, 0.2);
        }
        .icon-wrapper {
          background: rgba(255, 255, 255, 0.05);
          padding: 0.6rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .activity-info {
          flex: 1;
        }
        .activity-title {
          font-size: 0.9rem;
          font-weight: 600;
        }
        .student-email {
          font-size: 0.75rem;
          color: var(--border);
          font-weight: 400;
          margin-left: 4px;
        }
        .exam-tag {
          color: var(--accent);
        }
        .activity-msg {
          font-size: 0.75rem;
          color: var(--border);
        }
        .activity-timestamp {
          text-align: right;
          min-width: 100px;
        }
        .time { font-size: 0.8rem; font-weight: 500; }
        .date { font-size: 0.7rem; color: var(--border); }

        @media (max-width: 768px) {
          .activity-header {
            flex-direction: column;
            gap: 1rem;
          }
          .activity-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
          }
          .activity-timestamp {
            text-align: left;
            width: 100%;
            border-top: 1px solid rgba(255, 255, 255, 0.05);
            padding-top: 0.5rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .icon-wrapper {
            padding: 0.4rem;
          }
        }
      `}</style>
    </div>
  );
}
