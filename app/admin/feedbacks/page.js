import FeedbacksDashboard from './FeedbacksDashboard';

export default async function AdminFeedbacksPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-gradient">Feedback Analytics</h1>
          <p style={{ color: 'var(--border)' }}>Visualize student feedback across different courses.</p>
        </div>
      </div>
      
      <FeedbacksDashboard />
    </div>
  );
}
