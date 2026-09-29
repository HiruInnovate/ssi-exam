'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Phone, User, Send, ChevronLeft, Terminal, ShieldCheck } from 'lucide-react';
import { useModal } from '@/lib/contexts/ModalContext';
import Link from 'next/link';

export default function SupportForm({ userRole }) {
  const router = useRouter();
  const { showAlert } = useModal();
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        await showAlert('Message Sent', 'Your inquiry has been successfully sent to our support team. We will get back to you shortly.', 'SUCCESS');
        router.push(userRole ? (userRole === 'admin' ? '/admin' : '/dashboard') : '/');
      } else {
        showAlert('Error', data.error || 'Failed to send message', 'DANGER');
      }
    } catch (err) {
      showAlert('Error', 'A connection error occurred. Please try again.', 'DANGER');
    } finally {
      setLoading(false);
    }
  };

  const dashboardPath = userRole === 'admin' ? '/admin' : '/dashboard';
  const backPath = userRole ? dashboardPath : '/';
  const backLabel = userRole ? 'Back to Dashboard' : 'Back to Landing Page';

  return (
    <div className={`support-container ${userRole ? 'in-dashboard' : ''}`}>
      <Link href={backPath} className="back-link mb-4">
        <ChevronLeft size={20} />
        <span>{backLabel}</span>
      </Link>

      <div className="support-grid">
        {/* Header & Info */}
        <div className="support-info">
          <div className="badge mb-3">
            <ShieldCheck size={14} className="text-primary" />
            <span>Help & Assistance</span>
          </div>
          <h1 className="support-title mb-4">
            How can we <br />
            <span className="text-gradient">help you?</span>
          </h1>
          <p className="support-description mb-6">
            If you have technical issues, questions about your assessments, or need general assistance, please fill out the form. 
          </p>

          <div className="contact-details">
            <div className="contact-item glass-panel">
              <div className="icon-box"><Mail size={20} className="text-primary" /></div>
              <div>
                <p className="label">Official Support Email</p>
                <a href="mailto:ssicommunityadmin@onlinestudysmart.com" className="value">
                  ssicommunityadmin@onlinestudysmart.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="support-card-container">
          <div className="glass-panel support-card animate-in">
            <div className="card-header mb-4">
              <Terminal size={24} className="text-primary mb-1" />
              <h3>Contact Support</h3>
              <p>Send us a message</p>
            </div>

            <form onSubmit={handleSubmit} className="support-form">
              <div className="input-group">
                <label><User size={14} /> Full Name</label>
                <div className="input-wrapper">
                  <input 
                    type="text" 
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label><Phone size={14} /> Phone Number</label>
                <div className="input-wrapper">
                  <input 
                    type="tel" 
                    placeholder="+91 12345 67890"
                    value={formData.phone}
                    onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Your Message</label>
                <div className="input-wrapper">
                  <textarea 
                    rows="3" 
                    placeholder="Describe your issue..."
                    value={formData.message}
                    onChange={(e) => setFormData(p => ({ ...p, message: e.target.value }))}
                    required
                  ></textarea>
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-full mt-4" disabled={loading}>
                {loading ? 'Sending...' : (
                  <>
                    <span>Send Message</span>
                    <Send size={18} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      <style jsx>{`
        .support-container {
          width: 100%;
        }

        :global(.back-link),
        :global(.back-link:visited),
        :global(.back-link:active) {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--foreground) !important;
          opacity: 0.6;
          text-decoration: none;
          font-weight: 500;
          transition: 0.2s opacity;
        }

        :global(.back-link:hover) { 
          opacity: 1; 
          text-decoration: none; 
          color: var(--foreground) !important; 
        }

        .support-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }

        .support-title {
          font-size: 2.8rem;
          line-height: 1.1;
          margin: 0;
        }

        .support-description {
          font-size: 1rem;
          opacity: 0.7;
          line-height: 1.5;
          max-width: 450px;
        }

        .contact-item {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 1.5rem;
          border: 1px solid rgba(255,255,255,0.05);
        }

        .icon-box {
          width: 48px;
          height: 48px;
          background: rgba(16, 185, 129, 0.1);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .label {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          opacity: 0.5;
          margin-bottom: 0.25rem;
        }

        :global(.value) {
          color: var(--primary);
          text-decoration: none;
          font-weight: 700;
          font-size: 0.95rem;
          transition: 0.2s opacity;
          word-break: break-all;
        }

        :global(.value:hover) { opacity: 0.8; text-decoration: none; }

        .support-card {
          padding: 2rem;
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-premium);
        }

        .card-header h3 { font-size: 1.25rem; margin-bottom: 0.2rem; }
        .card-header p { opacity: 0.6; font-size: 0.8rem; }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          margin-bottom: 1rem;
        }

        .input-group label {
          font-size: 0.875rem;
          font-weight: 600;
          opacity: 0.8;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .animate-in {
          animation: slide-up 0.4s cubic-bezier(0, 0.5, 0.5, 1);
        }

        @keyframes slide-up {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        @media (max-width: 900px) {
          .support-grid { grid-template-columns: 1fr; gap: 3rem; }
          .support-title { font-size: 2.5rem; }
        }

        @media (max-width: 640px) {
          .support-title { font-size: 2rem; }
          .support-card { padding: 1.5rem; }
          .contact-item { padding: 1rem; gap: 1rem; }
          .icon-box { width: 40px; height: 40px; }
        }

        /* In-Dashboard Layout Tweaks */
        .in-dashboard .support-grid {
          gap: 2rem;
        }
        .in-dashboard .support-title {
          font-size: 2.5rem;
        }
        
        @media (max-width: 768px) {
          .in-dashboard .support-title {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  );
}
