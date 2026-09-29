'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { useModal } from '@/lib/contexts/ModalContext';

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  
  const [formData, setFormData] = useState({ title: '', description: '', razorpayLink: '' });
  
  const { showAlert, showConfirm } = useModal();

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/courses');
      if (!res.ok) throw new Error('Failed to fetch courses');
      const data = await res.json();
      setCourses(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const isEdit = !!editingCourse;
      const url = isEdit ? `/api/admin/courses/${editingCourse._id}` : '/api/admin/courses';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) throw new Error('Failed to save course');
      
      showAlert('Success', `Course ${isEdit ? 'updated' : 'added'} successfully.`, 'SUCCESS');
      
      setFormData({ title: '', description: '', razorpayLink: '' });
      setIsAdding(false);
      setEditingCourse(null);
      fetchCourses();
    } catch (err) {
      showAlert('Error', err.message, 'DANGER');
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await showConfirm(
      'Remove Course', 
      'Are you sure you want to remove this course from the cross-selling list?', 
      'DANGER'
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/courses/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete course');
      setCourses(courses.filter(c => c._id !== id));
      showAlert('Success', 'Course has been removed successfully.', 'SUCCESS');
    } catch (err) {
      showAlert('Error', err.message, 'DANGER');
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({ title: course.title, description: course.description, razorpayLink: course.razorpayLink });
    setIsAdding(true);
  };

  if (loading) return <div className="container p-8 text-center">Loading courses...</div>;

  return (
    <div className="relative">
      <div className="admin-header">
        <div>
          <h1 className="text-gradient">Other Courses</h1>
          <p className="hidden-mobile" style={{ color: 'var(--border)' }}>Manage cross-selling courses and external payment links.</p>
        </div>
        {!isAdding && (
          <button onClick={() => { setIsAdding(true); setEditingCourse(null); setFormData({ title: '', description: '', razorpayLink: '' }); }} className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
            <Plus size={18} />
            Add Course
          </button>
        )}
      </div>

      {isAdding && (
        <div className="glass-panel mb-6" style={{ padding: '2rem' }}>
          <h2 className="mb-4">{editingCourse ? 'Edit Course' : 'Add New Course'}</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label className="block mb-2 text-sm font-medium">Course Title *</label>
              <input 
                type="text" 
                required 
                className="input-field w-full"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="e.g. Master Python Programming"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium">Description</label>
              <textarea 
                className="input-field w-full"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="A compelling brief for the course..."
                rows="3"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium">Razorpay Link *</label>
              <input 
                type="url" 
                required 
                className="input-field w-full"
                value={formData.razorpayLink}
                onChange={(e) => setFormData({...formData, razorpayLink: e.target.value})}
                placeholder="e.g. https://pages.razorpay.com/python-course"
              />
            </div>
            <div className="flex gap-4 mt-4">
              <button type="submit" className="btn btn-primary">Save Course</button>
              <button type="button" onClick={() => { setIsAdding(false); setEditingCourse(null); setFormData({ title: '', description: '', razorpayLink: '' }); }} className="btn btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '1rem' }}>Title & Description</th>
              <th style={{ padding: '1rem' }}>Razorpay Link</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.length === 0 ? (
              <tr>
                <td colSpan="3" style={{ padding: '2rem', textAlign: 'center', color: 'var(--border)' }}>
                  No courses found. Add a course to start cross-selling.
                </td>
              </tr>
            ) : (
              courses.map((course) => (
                <tr key={course._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem', maxWidth: '300px' }}>
                    <div style={{ fontWeight: 600 }}>{course.title}</div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{course.description}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <a href={course.razorpayLink} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>View Payment Page</a>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleEdit(course)}
                        className="btn btn-secondary" 
                        style={{ padding: '0.4rem', border: '1px solid var(--border)' }}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(course._id)}
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
