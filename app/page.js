'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Code, GraduationCap, ShieldCheck, ChevronRight, Lock, User, Terminal, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
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
      {/* Background Elements */}
      <div className="bg-glow bg-glow-1"></div>
      <div className="bg-glow bg-glow-2"></div>

      {/* Navigation */}
      <nav className="navbar glass-panel">
        <div className="nav-container">
          <div className="flex items-center gap-2">
            <div className="logo-icon">
              <Terminal size={20} className="text-primary" />
            </div>
            <span className="font-bold text-lg tracking-tight">SSI Portal</span>
          </div>
          <div className="nav-links">
            <Link href="/support" className="nav-link">Support</Link>
          </div>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="hero-container container">
        <div className="hero-split">
          {/* Left Side: Content */}
          <div className="hero-content">
            <div className="badge">
              <ShieldCheck size={14} className="text-primary" />
              <span>AI-Proctored Examination</span>
            </div>
            <h1 className="hero-title">
              Engineering <br />
              <span className="text-gradient">Potential</span> through <br />
              Assessment.
            </h1>
            <p className="hero-subtitle">
              The industry-standard portal for coding challenges and MCQ assessments.
              Secure, standardized, and designed for modern developers.
            </p>

            <div className="hero-features">
              <div className="feature-item">
                <div className="feature-icon"><Code size={20} /></div>
                <span>Live Coding Challenges</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon"><GraduationCap size={20} /></div>
                <span>Certified Assessments</span>
              </div>
            </div>
          </div>

          {/* Right Side: Login Card */}
          <div className="hero-form">
            <div className="glass-panel auth-card-premium">
              <div className="card-header">
                <div className="logo-display-small">
                  <Image src="/logo.jpeg" alt="SSI Logo" width={100} height={40} priority />
                </div>
                <h3>Welcome Back</h3>
                <p>Sign in to your assessment portal</p>
              </div>

              {error && (
                <div className="error-badge">
                  {error}
                </div>
              )}

              {/* Role selector removed - login is student-only here */}

              <form onSubmit={handleLogin} className="auth-form-v2">
                <div className="input-group-v2">
                  <label>Email Address</label>
                  <div className="input-wrapper">
                    <input
                      type="email"
                      placeholder="student@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="input-group-v2">
                  <label>Password</label>
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

                <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ChevronRight size={18} />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>


    </main>
  );
}
