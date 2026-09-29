'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Star, CheckCircle, SkipForward } from 'lucide-react';

const RATING_CATEGORIES = [
  { id: 'teaching', label: 'Teaching Skills' },
  { id: 'materials', label: 'Course Materials' },
  { id: 'delivery', label: 'Course Delivery' },
  { id: 'learnerUx', label: 'Learner Portal UX' },
  { id: 'examUx', label: 'Exam Portal UX' }
];

export default function FeedbackPage({ params }) {
  const unwrappedParams = use(params);
  const submissionId = unwrappedParams.submissionId;
  const router = useRouter();

  const [ratings, setRatings] = useState({
    teaching: 0,
    materials: 0,
    delivery: 0,
    learnerUx: 0,
    examUx: 0
  });
  const [suggestions, setSuggestions] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleRating = (category, value) => {
    setRatings(prev => ({ ...prev, [category]: value }));
  };

  const handleStarHover = (category, value) => {
    // Optional: add hover preview state if desired, keeping simple for now
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/exam/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId,
          ratings,
          suggestions
        })
      });

      if (!res.ok) {
        throw new Error('Failed to submit feedback');
      }

      setSubmitted(true);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const skipFeedback = () => {
    router.push('/dashboard/results');
  };

  if (submitted) {
    return (
      <div className="container" style={{ maxWidth: '800px', marginTop: '4rem', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '4rem 2rem' }}>
          <CheckCircle size={64} style={{ color: 'var(--success)', margin: '0 auto 1.5rem auto' }} />
          <h2 className="mb-4">Thank you for your feedback!</h2>
          <p style={{ color: 'var(--foreground)', marginBottom: '2rem' }}>Your insights help us immensely in improving Study Smart Innovations.</p>
          <button className="btn btn-primary" onClick={skipFeedback}>
             Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '800px', marginTop: '3rem', paddingBottom: '3rem' }}>
      <h1 className="text-gradient text-center mb-2">We Value Your Feedback</h1>
      <p className="text-center mb-8" style={{ color: 'var(--border)' }}>Please take a moment to rate your experience before viewing your results.</p>

      {error && <div className="mb-4 p-3" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)' }}>{error}</div>}

      <div className="glass-panel" style={{ padding: '2.5rem' }}>
        <form onSubmit={handleSubmit}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
            {RATING_CATEGORIES.map(cat => (
              <div key={cat.id} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontWeight: 500 }}>{cat.label}</div>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRating(cat.id, star)}
                      style={{ 
                        background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.2rem',
                        color: star <= ratings[cat.id] ? 'var(--accent)' : 'rgba(255,255,255,0.2)'
                      }}
                    >
                      <Star fill={star <= ratings[cat.id] ? 'var(--accent)' : 'none'} size={28} />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: 500 }}>Any specific suggestions for improvement?</label>
            <textarea
              value={suggestions}
              onChange={(e) => setSuggestions(e.target.value)}
              className="form-control"
              style={{ width: '100%', minHeight: '120px', resize: 'vertical' }}
              placeholder="Tell us what you liked or how we can improve..."
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button type="button" onClick={skipFeedback} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <SkipForward size={16} /> Skip for now
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {loading ? 'Submitting...' : <><CheckCircle size={16} /> Submit Feedback</>}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
