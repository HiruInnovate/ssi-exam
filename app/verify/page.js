'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ShieldCheck, XCircle } from 'lucide-react';

export default function VerificationPortal() {
  const [certId, setCertId] = useState('');
  const [captchaNum1, setCaptchaNum1] = useState(0);
  const [captchaNum2, setCaptchaNum2] = useState(0);
  const [userCaptcha, setUserCaptcha] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // null, { valid: true, data: {...} }, { valid: false, error: '...' }

  const generateCaptcha = () => {
    setCaptchaNum1(Math.floor(Math.random() * 20));
    setCaptchaNum2(Math.floor(Math.random() * 20));
    setUserCaptcha('');
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleVerify = async (e) => {
    e.preventDefault();
    setResult(null);

    // Simple CAPTCHA logic
    if (parseInt(userCaptcha) !== captchaNum1 + captchaNum2) {
      setResult({ valid: false, error: 'INCORRECT CAPTCHA. Please try again.' });
      generateCaptcha();
      return;
    }

    if (!certId.trim()) {
      setResult({ valid: false, error: 'Please enter a Certificate ID.' });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/verify?id=${encodeURIComponent(certId.trim())}`);
      const data = await res.json();
      
      if (res.ok && data.valid) {
        setResult({ valid: true, data: data.certificate });
      } else {
        setResult({ valid: false, error: data.error || 'CERTIFICATE NOT FOUND OR INVALID' });
      }
    } catch (err) {
      setResult({ valid: false, error: 'Verification service error. Try again later.' });
    } finally {
      setLoading(false);
      generateCaptcha();
    }
  };

  return (
    <div className="container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-panel" style={{ padding: '3rem', maxWidth: '600px', width: '100%' }}>
         <div className="logo-display mb-6">
           <Image src="/logo.jpeg" alt="Study Smart Innovations" width={200} height={80} style={{ objectFit: 'contain' }} />
         </div>
         
         <h1 className="text-center text-gradient mb-2" style={{ fontSize: '2rem' }}>Certificate Verification</h1>
         <p className="text-center mb-8" style={{ color: 'var(--border)' }}>Verify the authenticity of Study Smart Innovations credentials.</p>

         <form onSubmit={handleVerify} className="flex flex-col gap-4">
           <div>
             <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Certificate ID</label>
             <input 
               type="text" 
               placeholder="e.g. A1B2C3D4E5" 
               value={certId} 
               onChange={(e) => setCertId(e.target.value.toUpperCase())}
               required 
               style={{ textTransform: 'uppercase', fontSize: '1.2rem', padding: '1rem', textAlign: 'center', letterSpacing: '2px' }}
             />
           </div>

           <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Security Challenge</label>
              <div className="flex gap-4 items-center">
                 <div style={{ background: 'var(--background)', border: '1px solid var(--border)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '1.2rem', fontWeight: 'bold' }}>
                    {captchaNum1} + {captchaNum2} = 
                 </div>
                 <input 
                   type="number" 
                   value={userCaptcha}
                   onChange={e => setUserCaptcha(e.target.value)}
                   required
                   style={{ flex: 1, fontSize: '1.2rem' }}
                   placeholder="?"
                 />
              </div>
           </div>

           <button type="submit" className="btn btn-primary mt-4" disabled={loading} style={{ padding: '1rem', fontSize: '1.1rem' }}>
              {loading ? 'Verifying...' : 'Verify Authenticity'}
           </button>
         </form>

         {result && (
           <div className="mt-8" style={{ padding: '1.5rem', background: 'var(--background)', borderRadius: 'var(--radius-md)', border: `2px solid ${result.valid ? 'var(--success)' : 'var(--danger)'}` }}>
              {result.valid ? (
                <div style={{ textAlign: 'center' }}>
                  <ShieldCheck size={48} color="var(--success)" style={{ margin: '0 auto 1rem' }} />
                  <h3 style={{ color: 'var(--success)', marginBottom: '1rem' }}>CERTIFICATE VERIFIED</h3>
                  <p><strong>Name:</strong> {result.data.name}</p>
                  <p><strong>Course:</strong> {result.data.course}</p>
                  <p><strong>Issue Date:</strong> {new Date(result.data.issuedAt).toLocaleDateString()}</p>
                  <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--border)' }}>This certificate is an official document issued by Study Smart Innovations.</p>
                </div>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <XCircle size={48} color="var(--danger)" style={{ margin: '0 auto 1rem' }} />
                  <h3 style={{ color: 'var(--danger)' }}>{result.error}</h3>
                </div>
              )}
           </div>
         )}
      </div>
    </div>
  );
}
