'use client';

import { useState, useEffect } from 'react';
import { Rocket, Sparkles, ExternalLink } from 'lucide-react';

export default function StudentCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch('/api/student/courses');
        if (!res.ok) throw new Error('Failed to fetch courses');
        const data = await res.json();
        setCourses(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  if (loading) return <div className="container p-8 text-center text-gradient">Loading available courses...</div>;

  return (
    <div className="relative">
      <div className="admin-header mb-8 flex-col items-start gap-2">
        <h1 className="text-gradient flex items-center gap-2">
          <Rocket className="text-primary" /> Maximize Your Potential
        </h1>
        <p style={{ color: 'var(--border)' }}>Explore our premier online courses and upgrade your skills today.</p>
      </div>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
          {error}
        </div>
      )}

      {courses.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <Sparkles size={40} style={{ color: 'var(--border)', opacity: 0.5 }} />
          <h3 style={{ color: 'var(--border)' }}>Check back later!</h3>
          <p style={{ opacity: 0.7 }}>We are preparing some amazing new courses for you.</p>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
          gap: '2rem' 
        }}>
          {courses.map(course => (
            <div 
              key={course._id} 
              className="glass-panel hover-glow" 
              style={{ 
                padding: '2rem', 
                display: 'flex', 
                flexDirection: 'column', 
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease'
              }}
            >
              {/* Decorative top border */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, var(--primary), #8b5cf6)' }} />
              
              <h2 className="mb-3" style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>{course.title}</h2>
              
              {course.description && (
                <p style={{ color: 'var(--border)', lineHeight: 1.6, flex: 1, marginBottom: '2rem', fontSize: '0.95rem' }}>
                  {course.description}
                </p>
              )}
              
              <a 
                href={course.razorpayLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  textDecoration: 'none',
                  padding: '0.8rem',
                  fontWeight: 600,
                  fontSize: '1rem',
                  marginTop: 'auto'
                }}
              >
                Enroll Now <ExternalLink size={18} />
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
