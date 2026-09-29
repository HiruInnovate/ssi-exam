'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { UserPlus, Trash2, Edit } from 'lucide-react';
import { useModal } from '@/lib/contexts/ModalContext';

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { showAlert, showConfirm } = useModal();

  const [editingStudent, setEditingStudent] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', email: '', phone: '', batch: { C: false, Java: false, Python: false } });
  const [editLoading, setEditLoading] = useState(false);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/students');
      if (!res.ok) throw new Error('Failed to fetch students');
      const data = await res.json();
      setStudents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const openEditModal = (student) => {
    const batches = { C: false, Java: false, Python: false };
    if (student.batch) {
      student.batch.forEach(b => { batches[b] = true; });
    }
    setEditFormData({
      name: student.name,
      email: student.email,
      phone: student.phone,
      batch: batches
    });
    setEditingStudent(student);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      const selectedBatches = Object.keys(editFormData.batch).filter(k => editFormData.batch[k]);
      if (selectedBatches.length === 0) throw new Error("Please select at least one batch.");

      const res = await fetch(`/api/admin/students/${editingStudent._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editFormData.name,
          email: editFormData.email,
          phone: editFormData.phone,
          batch: selectedBatches
        })
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update student');
      }

      setStudents(students.map(s => 
        s._id === editingStudent._id 
        ? { ...s, name: editFormData.name, email: editFormData.email, phone: editFormData.phone, batch: selectedBatches }
        : s
      ));
      setEditingStudent(null);
      showAlert('Success', 'Student details updated successfully.', 'SUCCESS');
    } catch (err) {
      showAlert('Error', err.message, 'DANGER');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await showConfirm(
      'Remove Student', 
      'Are you sure you want to remove this student? All their exam history, attempts, and associated data will be permanently deleted. This action cannot be reversed.', 
      'DANGER'
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/students/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete student');
      setStudents(students.filter(s => s._id !== id));
      showAlert('Success', 'Student has been removed successfully.', 'SUCCESS');
    } catch (err) {
      showAlert('Error', err.message, 'DANGER');
    }
  };

  if (loading) return <div className="container p-8 text-center">Loading students...</div>;

  return (
    <div className="relative">
      <div className="admin-header">
        <div>
          <h1 className="text-gradient">Student Management</h1>
          <p className="hidden-mobile" style={{ color: 'var(--border)' }}>Manage enrolled students and their exam attempts.</p>
        </div>
        <Link href="/admin/students/new" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
          <UserPlus size={18} />
          Add Student
        </Link>
      </div>

      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '1rem' }}>Name</th>
              <th style={{ padding: '1rem' }}>Email</th>
              <th style={{ padding: '1rem' }}>Enrolled Batches</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--border)' }}>
                  No students found. Add a student to get started.
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 600 }}>{student.name}</div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>{student.phone}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>{student.email}</td>
                  <td style={{ padding: '1rem' }}>
                    <div className="flex gap-2 flex-wrap">
                       {student.batch?.map(b => (
                         <span key={b} style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', border: '1px solid rgba(59, 130, 246, 0.2)' }}>{b}</span>
                       ))}
                    </div>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <div className="flex flex-col items-end gap-2">
                      <button 
                        onClick={() => openEditModal(student)}
                        className="btn" 
                        style={{ padding: '0.4rem 0.8rem', minWidth: '120px', fontSize: '0.8rem', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)', border: '1px solid rgba(59, 130, 246, 0.2)' }}
                      >
                        <Edit size={14} />
                        <span>Edit Details</span>
                      </button>
                      <button 
                        onClick={() => handleDelete(student._id)}
                        className="btn btn-danger" 
                        style={{ padding: '0.4rem 0.8rem', minWidth: '120px', fontSize: '0.8rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                      >
                        <Trash2 size={14} />
                        <span>Remove Student</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editingStudent && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
            <h2 className="text-gradient" style={{ marginBottom: '1.5rem' }}>Edit Student</h2>
            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Full Name</label>
                <input type="text" required value={editFormData.name} onChange={e => setEditFormData({...editFormData, name: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'rgba(0,0,0,0.2)', color: 'var(--foreground)' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email</label>
                <input type="email" required value={editFormData.email} onChange={e => setEditFormData({...editFormData, email: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'rgba(0,0,0,0.2)', color: 'var(--foreground)' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Phone</label>
                <input type="tel" required value={editFormData.phone} onChange={e => setEditFormData({...editFormData, phone: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'rgba(0,0,0,0.2)', color: 'var(--foreground)' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Batches</label>
                <div className="flex gap-4 flex-wrap">
                  {['C', 'Java', 'Python'].map(b => (
                    <label key={b} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" style={{ width: 'auto' }}
                        checked={editFormData.batch[b] || false}
                        onChange={() => setEditFormData(prev => ({...prev, batch: {...prev.batch, [b]: !prev.batch[b]}}))}
                      />
                      {b}
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-4 mt-4">
                <button type="button" onClick={() => setEditingStudent(null)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={editLoading}>
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
