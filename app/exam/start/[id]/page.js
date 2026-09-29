'use client';

import { useState, useRef, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, CheckCircle, AlertCircle, Monitor, AlertOctagon, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ExamStartPage({ params }) {
  const unwrappedParams = use(params);
  const examId = unwrappedParams.id;
  const router = useRouter();
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  
  const [isCameraEnabled, setIsCameraEnabled] = useState(false);
  const [snapTaken, setSnapTaken] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [examState, setExamState] = useState(null); // Will hold exam rules, etc. fetched from API
  const [agreed, setAgreed] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  
  // Device detection
  useEffect(() => {
    const checkDevice = () => {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isSmallScreen = window.innerWidth < 1024;
      setIsMobileDevice(isMobile || isSmallScreen);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  useEffect(() => {
    if (isMobileDevice) return;
    // Fetch Exam config (rules, duration, title)
    const fetchExam = async () => {
      try {
        const res = await fetch(`/api/exam/config?id=${examId}`);
        const data = await res.json();
        if (res.ok) {
           setExamState(data.exam);
        } else {
           setError(data.error);
        }
      } catch (err) {
        setError("Failed to load exam details.");
      }
    };
    fetchExam();

    // Cleanup camera on unmount
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [examId]);

  useEffect(() => {
    if (streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(e => console.error("Playback failed:", e));
    }
  }, [streamRef.current]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 320, height: 240 } 
      });
      streamRef.current = mediaStream;
      setIsCameraEnabled(true);
      setSnapTaken(false); // Trigger re-render to attach video element
    } catch (err) {
      console.error("Camera Error:", err);
      setError("Camera access is required for proctoring. Please allow camera access and ensure no other app is using it.");
    }
  };

  const takeSnap = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const context = canvasRef.current.getContext('2d');
    
    // Mirror the canvas to match the mirrored video feed
    context.translate(320, 0);
    context.scale(-1, 1);
    context.drawImage(videoRef.current, 0, 0, 320, 240);
    
    // Reset transformation
    context.setTransform(1, 0, 0, 1, 0, 0);
    setSnapTaken(true);
  };

  const proceedToExam = async () => {
    if (!snapTaken) return;
    
    // Open window synchronously to bypass async popup blockers
    const popupWin = window.open('about:blank', '_blank', `width=${window.screen.availWidth},height=${window.screen.availHeight},fullscreen=yes`);
    
    if (!popupWin || popupWin.closed || typeof popupWin.closed === 'undefined') {
        setError('⚠️ Popup blocked! Please check your URL address bar, click the popup-blocker icon, select "Always allow pop-ups for this site", and click Start again.');
        return;
    }
    
    // Native loader while background tasks finish
    popupWin.document.write('<body style="background:#0f172a;color:white;display:flex;align-items:center;justify-content:center;font-family:sans-serif;height:100vh;margin:0;"><h2>Initializing Secure Exam Environment...</h2></body>');
    
    setLoading(true);
    try {
      const snapData = canvasRef.current.toDataURL('image/jpeg');
      
      const res = await fetch('/api/exam/begin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examId, snap: snapData })
      });
      
      if (!res.ok) throw new Error("Failed to initialize exam session.");

      await fetch('/api/exam/log_activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'STARTED',
          examId,
          examTitle: examState.title,
          message: 'Student successfully verified identity and started the exam.'
        })
      });
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      // Safely navigate the full-screen window to the player
      popupWin.location.href = `/exam/play/${examId}`;
      
      // Redirect start page to avoid double instances
      router.push('/dashboard/results');
    } catch (err) {
      popupWin.close();
      setError(err.message);
      setLoading(false);
    }
  };

  if (isMobileDevice) {
    return (
      <div className="restriction-overlay">
        <div className="glass-panel restriction-card">
           <div className="icon-badge">
             <Monitor size={48} />
           </div>
           
           <h1 className="restriction-title">Desktop Required</h1>
           
           <div className="alert-tag">
             <AlertOctagon size={16} />
             <span>RESTRICTED ACCESS</span>
           </div>
           
           <p className="restriction-text">
             For security and technical reasons, assessments must be completed on a <strong>Laptop or Desktop</strong> environment. 
             Mobile devices and tablets are not supported for this exam.
           </p>

           <Link href="/dashboard" className="btn btn-secondary back-btn">
             <ArrowLeft size={18} /> Back to Dashboard
           </Link>
        </div>

        <style jsx>{`
          .restriction-overlay {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 1.5rem;
            background: var(--background);
          }
          .restriction-card {
            width: 100%;
            max-width: 500px;
            padding: 3rem;
            border-radius: 2rem;
            text-align: center;
            box-shadow: 0 20px 50px rgba(0,0,0,0.5);
          }
          .icon-badge {
            background: rgba(239, 68, 68, 0.1);
            color: var(--danger);
            padding: 1.5rem;
            border-radius: 50%;
            width: fit-content;
            margin: 0 auto 1.5rem;
          }
          .restriction-title {
            font-size: 2rem;
            margin-bottom: 0.5rem;
            color: var(--foreground);
            font-family: var(--font-space-grotesk);
          }
          .alert-tag {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            margin-bottom: 1.5rem;
            color: var(--danger);
            font-weight: 600;
            font-size: 0.8rem;
            letter-spacing: 0.05em;
          }
          .restriction-text {
            color: var(--border);
            line-height: 1.6;
            margin-bottom: 2rem;
            font-size: 1.1rem;
          }
          :global(.back-btn) {
            width: 100%;
            text-decoration: none;
          }

          @media (max-width: 640px) {
            .restriction-card {
              padding: 2rem 1.5rem;
              border-radius: 1.5rem;
            }
            .restriction-title {
              font-size: 1.5rem;
            }
            .restriction-text {
              font-size: 1rem;
              margin-bottom: 1.5rem;
            }
            .icon-badge {
              padding: 1rem;
              margin-bottom: 1rem;
            }
          }
        `}</style>
      </div>
    );
  }

  if (!examState) return <div className="container mt-8 text-center">Loading Exam Context...</div>;

  return (
    <div className="container" style={{ maxWidth: '800px', marginTop: '3rem' }}>
      <h1 className="text-gradient">Ready to Begin?</h1>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>{examState.title}</h2>

      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h3 className="mb-4" style={{ color: 'var(--danger)' }}>⚠️ Important Guidelines (CRITICAL)</h3>
        
        <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid var(--accent)', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
          <h4 style={{ color: 'var(--accent)', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <AlertCircle size={20} /> Action Required: Browser Permissions
          </h4>
          <p style={{ fontSize: '1rem', color: 'var(--foreground)' }}>
             You <strong>must</strong> grant this site access to your <strong>Camera</strong> and you must also <strong>allow Pop-ups and Redirects</strong>! If the exam window fails to open, look for a blocked pop-up icon in your URL address bar to immediately allow it.
          </p>
        </div>

        <ul className="flex flex-col gap-3 mb-4" style={{ paddingLeft: '1.5rem', color: 'var(--foreground)' }}>
          {examState.rules?.map((rule, idx) => (
             <li key={idx}>{rule}</li>
          ))}
          <li><strong>Proctoring:</strong> Your camera must remain ON. You must hold an <strong>original Government ID (Aadhaar Card, Voter ID, PAN Card, College ID, or Library Card with an image)</strong> next to your face for the snapshot right now.</li>
          <li><strong>Anti-Cheat:</strong> The exam portal will launch in a new full-screen window. If you try to minimize the window, exit full-screen, or switch tabs, a warning dialog box will appear. If you switch tabs again, you will be disqualified.</li>
        </ul>
      </div>

      {error && <div className="mb-4 p-3" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)' }}>{error}</div>}

      <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h3 className="mb-4 text-center">Identity Verification</h3>
        <p className="text-center mb-6" style={{ color: 'var(--foreground)' }}>Please hold your Government ID next to your face and take a snapshot.</p>
        
        {!isCameraEnabled ? (
          <button className="btn btn-secondary mb-4" onClick={startCamera}>
            <Camera size={20} /> Enable Camera
          </button>
        ) : (
          <div className="flex flex-col items-center gap-4">
             <div style={{ position: 'relative', border: '2px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
               {/* Display video feed, hide if snap taken to show canvas instead */}
               <video 
                 ref={videoRef} 
                 autoPlay 
                 playsInline 
                 muted 
                 width="320" 
                 height="240" 
                 style={{ display: snapTaken ? 'none' : 'block', transform: 'scaleX(-1)' }}
               ></video>
               <canvas ref={canvasRef} width="320" height="240" style={{ display: snapTaken ? 'block' : 'none' }}></canvas>
             </div>
             
             {!snapTaken ? (
               <button className="btn btn-primary" onClick={takeSnap}>Capture ID Snap</button>
             ) : (
               <div className="flex flex-col gap-4 w-full">
                 <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem', cursor: 'pointer', background: 'var(--secondary)', padding: '1rem', borderRadius: '8px', border: `1px solid ${agreed ? 'var(--success)' : 'var(--border)'}` }}>
                   <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} style={{ marginTop: '0.2rem', width: 'auto' }} />
                   <span style={{ fontSize: '0.9rem', color: 'var(--foreground)' }}>I agree and declare that the document furnished in the snapshot is strictly original and there is no falsehood or tampering involved. I also agree to unblock popups.</span>
                 </label>
                 
                 <div className="flex gap-4 self-center mt-2">
                   <button className="btn btn-secondary" onClick={() => setSnapTaken(false)}>Retake Snap</button>
                   <button className="btn btn-success" onClick={proceedToExam} disabled={loading || !agreed}>
                     {loading ? 'Launching Exam...' : <><CheckCircle size={20} /> Start Examination</>}
                   </button>
                 </div>
               </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
}
