'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, ChevronRight, Lock, Eye, EyeOff, Terminal } from 'lucide-react';

export default function AdminHiddenLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: 'admin' }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      router.push(data.redirect);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="landing-wrapper">
      <div className="bg-glow bg-glow-1"></div>
      <div className="bg-glow bg-glow-2"></div>

      <div className="hero-container flex items-center justify-center min-h-screen">
        <div className="auth-card-premium glass-panel" style={{ width: '450px' }}>
          <div className="card-header">
            <div className="logo-display-small">
              <Image src="/logo.jpeg" alt="SSI Logo" width={100} height={40} priority />
            </div>
            <div className="badge mb-4 mx-auto" style={{ width: 'fit-content' }}>
              <ShieldCheck size={14} className="text-primary" />
              <span>Administrative Access</span>
            </div>
            <h3>Portal Login</h3>
            <p>Access management dashboard</p>
          </div>

          {error && (
            <div className="error-badge">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="auth-form-v2">
            <div className="input-group-v2">
              <label>Admin Email</label>
              <div className="input-wrapper">
                <input
                  type="email"
                  placeholder="admin@studysmart.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group-v2">
              <label>Security Key</label>
              <div className="input-wrapper relative flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ paddingRight: '2.5rem' }}
                />
                <button 
                  type="button"
                  className="password-toggle-v2"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    opacity: 0.5,
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Verifying...' : (
                <>
                  <span>Sign In to Admin</span>
                  <ChevronRight size={18} />
                </>
              )}
            </button>
            <Link href="/" className="text-center mt-4" style={{ fontSize: '0.8rem', opacity: 0.5, textDecoration: 'none' }}>
              Back to main site
            </Link>
          </form>
        </div>
      </div>

      <style jsx>{`
        .landing-wrapper {
          min-height: 100vh;
          width: 100%;
          position: relative;
          background-color: var(--background);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          overflow-x: hidden;
        }

        .bg-glow {
          position: absolute;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          filter: blur(120px);
          z-index: 0;
          opacity: 0.1;
          pointer-events: none;
        }

        .bg-glow-1 { top: -100px; right: -100px; background: var(--primary); }
        .bg-glow-2 { bottom: -100px; left: -100px; background: var(--accent); }

        .auth-card-premium {
          padding: 2.5rem;
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-premium);
          z-index: 10;
        }

        .card-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .logo-display-small {
          margin-bottom: 1.5rem;
          display: flex;
          justify-content: center;
        }

        .badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
          padding: 0.4rem 0.8rem;
          border-radius: 2rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--primary);
        }

        .auth-form-v2 {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .input-group-v2 {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .input-group-v2 label {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          opacity: 0.5;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-wrapper input {
          width: 100%;
        }

        .btn-full {
          width: 100%;
          margin-top: 0.5rem;
        }

        .error-badge {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #ef4444;
          padding: 0.75rem;
          border-radius: var(--radius-md);
          font-size: 0.8125rem;
          margin-bottom: 1.5rem;
          text-align: center;
        }

        @media (max-width: 640px) {
          .auth-card-premium {
            width: 100% !important;
            padding: 1.5rem;
          }
          .landing-wrapper {
            padding: 1rem;
            overflow-y: auto;
            height: 100vh;
            -webkit-overflow-scrolling: touch;
          }
        }
      `}</style>
    </main>
  );
}
