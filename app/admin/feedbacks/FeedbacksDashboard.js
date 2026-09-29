'use client';

import { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

export default function FeedbacksDashboard() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('All');

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const res = await fetch('/api/admin/feedbacks');
        if (!res.ok) throw new Error('Failed to fetch feedbacks');
        const data = await res.json();
        setFeedbacks(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFeedbacks();
  }, []);

  const courses = useMemo(() => {
    const uniqueCourses = new Set(feedbacks.map(f => f.course).filter(Boolean));
    return ['All', ...Array.from(uniqueCourses)];
  }, [feedbacks]);

  const filteredFeedbacks = useMemo(() => {
    if (selectedCourse === 'All') return feedbacks;
    return feedbacks.filter(f => f.course === selectedCourse);
  }, [feedbacks, selectedCourse]);

  const chartData = useMemo(() => {
    if (filteredFeedbacks.length === 0) return [];

    let totals = { teaching: 0, materials: 0, delivery: 0, learnerUx: 0, examUx: 0 };
    let counts = { teaching: 0, materials: 0, delivery: 0, learnerUx: 0, examUx: 0 };

    filteredFeedbacks.forEach(f => {
      const r = f.ratings || {};
      for (const key in totals) {
        if (r[key]) {
          totals[key] += r[key];
          counts[key] += 1;
        }
      }
    });

    const labels = {
      teaching: 'Teaching Skills',
      materials: 'Materials',
      delivery: 'Course Delivery',
      learnerUx: 'Learner Portal',
      examUx: 'Exam Portal'
    };

    return Object.keys(totals).map(key => ({
      subject: labels[key],
      average: counts[key] > 0 ? Number((totals[key] / counts[key]).toFixed(2)) : 0,
      fullMark: 5
    }));
  }, [filteredFeedbacks]);

  if (loading) return <div className="p-4">Loading feedback data...</div>;
  if (error) return <div className="p-4" style={{ color: 'var(--danger)' }}>Error: {error}</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Controls */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <h3 style={{ margin: 0 }}>Filter by Course:</h3>
        <select 
          className="form-control" 
          value={selectedCourse} 
          onChange={(e) => setSelectedCourse(e.target.value)}
          style={{ maxWidth: '200px' }}
        >
          {courses.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <span style={{ marginLeft: 'auto', color: 'var(--border)', fontSize: '0.9rem' }}>
          Total Responses: {filteredFeedbacks.length}
        </span>
      </div>

      {filteredFeedbacks.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--border)' }}>
          No feedback data available for the selected course.
        </div>
      ) : (
        <>
          {/* Charts Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
            
            {/* Radar Chart */}
            <div className="glass-panel" style={{ padding: '2rem', height: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h3 className="mb-4">Aggregate Sentiment Map</h3>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                  <PolarGrid stroke="rgba(255,255,255,0.2)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--foreground)', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fill: 'var(--border)' }} />
                  <Radar name="Average Rating" dataKey="average" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.5} />
                  <Tooltip wrapperStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Bar Chart */}
            <div className="glass-panel" style={{ padding: '2rem', height: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h3 className="mb-4">Average Scores by Category</h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="subject" tick={{ fill: 'var(--foreground)', fontSize: 12 }} />
                  <YAxis domain={[0, 5]} tick={{ fill: 'var(--border)' }} />
                  <Tooltip wrapperStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                  <Bar dataKey="average" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
          </div>

          {/* Text Suggestions */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 className="mb-4">Detailed Written Suggestions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredFeedbacks.filter(f => f.suggestions && f.suggestions.trim().length > 0).length === 0 ? (
                <p style={{ color: 'var(--border)', fontStyle: 'italic' }}>No written suggestions provided for this segment.</p>
              ) : (
                filteredFeedbacks.map(f => {
                  if (!f.suggestions || !f.suggestions.trim()) return null;
                  return (
                    <div key={f._id} style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                        <strong style={{ color: 'var(--primary)' }}>{f.studentName || 'Anonymous Student'}</strong>
                        <span style={{ fontSize: '0.8rem', color: 'var(--border)' }}>{new Date(f.createdAt).toLocaleDateString()} • Course: {f.course || 'Unknown'}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.5, color: '#d1d5db' }}>"{f.suggestions}"</p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
