'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, CheckCircle, XCircle } from 'lucide-react';
import { useModal } from '@/lib/contexts/ModalContext';

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  
  const [formData, setFormData] = useState({ title: '', message: '', isActive: true });
  
  const { showAlert, showConfirm } = useModal();

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/announcements');
      if (!res.ok) throw new Error('Failed to fetch announcements');
      const data = await res.json();
      setAnnouncements(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const isEdit = !!editingAnnouncement;
      const url = isEdit ? `/api/admin/announcements/${editingAnnouncement._id}` : '/api/admin/announcements';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) throw new Error('Failed to save announcement');
      
      showAlert('Success', `Announcement ${isEdit ? 'updated' : 'added'} successfully.`, 'SUCCESS');
      
      setFormData({ title: '', message: '', isActive: true });
      setIsAdding(false);
      setEditingAnnouncement(null);
      fetchAnnouncements();
    } catch (err) {
      showAlert('Error', err.message, 'DANGER');
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await showConfirm(
      'Remove Announcement', 
      'Are you sure you want to completely remove this announcement?', 
      'DANGER'
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/announcements/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete announcement');
      setAnnouncements(announcements.filter(a => a._id !== id));
      showAlert('Success', 'Announcement has been removed successfully.', 'SUCCESS');
    } catch (err) {
      showAlert('Error', err.message, 'DANGER');
    }
  };

  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({ title: announcement.title, message: announcement.message, isActive: announcement.isActive });
    setIsAdding(true);
  };
  
  const toggleStatus = async (announcement) => {
    try {
      const updatedData = { ...announcement, isActive: !announcement.isActive };
      const res = await fetch(`/api/admin/announcements/${announcement._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      if (!res.ok) throw new Error('Failed to update status');
      setAnnouncements(announcements.map(a => a._id === announcement._id ? updatedData : a));
    } catch (err) {
      showAlert('Error', err.message, 'DANGER');
    }
  };

  if (loading) return <div className="container p-8 text-center">Loading announcements...</div>;

  return (
    <div className="relative">
      <div className="admin-header">
        <div>
          <h1 className="text-gradient">Announcements</h1>
          <p className="hidden-mobile" style={{ color: 'var(--border)' }}>Manage global notifications visible to students.</p>
        </div>
        {!isAdding && (
          <button onClick={() => { setIsAdding(true); setEditingAnnouncement(null); setFormData({ title: '', message: '', isActive: true }); }} className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
            <Plus size={18} />
            Add Announcement
          </button>
        )}
      </div>

      {isAdding && (
        <div className="glass-panel mb-6" style={{ padding: '2rem' }}>
          <h2 className="mb-4">{editingAnnouncement ? 'Edit Announcement' : 'Add New Announcement'}</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label className="block mb-2 text-sm font-medium">Title *</label>
              <input 
                type="text" 
                required 
                className="input-field w-full"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="e.g. New Java Batch Starting!"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium">Message *</label>
              <textarea 
                required
                className="input-field w-full"
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                placeholder="Detailed announcement message..."
                rows="4"
              />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input 
                type="checkbox" 
                id="isActive" 
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer' }}
              />
              <label htmlFor="isActive" style={{ cursor: 'pointer', userSelect: 'none' }}>Active (Visible to Students)</label>
            </div>
            <div className="flex gap-4 mt-4">
              <button type="submit" className="btn btn-primary">Save Announcement</button>
              <button type="button" onClick={() => { setIsAdding(false); setEditingAnnouncement(null); setFormData({ title: '', message: '', isActive: true }); }} className="btn btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '1rem' }}>Announcement</th>
              <th style={{ padding: '1rem', width: '100px' }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {announcements.length === 0 ? (
              <tr>
                <td colSpan="3" style={{ padding: '2rem', textAlign: 'center', color: 'var(--border)' }}>
                  No announcements found. Add one to notify students.
                </td>
              </tr>
            ) : (
              announcements.map((announcement) => (
                <tr key={announcement._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem', maxWidth: '400px' }}>
                    <div style={{ fontWeight: 600, fontSize: '1.05rem', marginBottom: '0.2rem' }}>{announcement.title}</div>
                    <div style={{ fontSize: '0.9rem', opacity: 0.8, whiteSpace: 'pre-wrap' }}>{announcement.message}</div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.5, marginTop: '0.4rem' }}>
                      Created: {new Date(announcement.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <button 
                      onClick={() => toggleStatus(announcement)}
                      style={{ 
                        display: 'flex', alignItems: 'center', gap: '0.4rem', 
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        color: announcement.isActive ? 'var(--success)' : 'var(--border)'
                      }}
                      title="Click to toggle status"
                    >
                      {announcement.isActive ? <CheckCircle size={18} /> : <XCircle size={18} />}
                      <span style={{ fontSize: '0.9rem' }}>{announcement.isActive ? 'Active' : 'Inactive'}</span>
                    </button>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right', verticalAlign: 'top' }}>
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleEdit(announcement)}
                        className="btn btn-secondary" 
                        style={{ padding: '0.4rem', border: '1px solid var(--border)' }}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(announcement._id)}
                        className="btn btn-danger" 
                        style={{ padding: '0.4rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                      >
                        <Trash2 size={16} />
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
