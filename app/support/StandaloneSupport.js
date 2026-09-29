'use client';

export default function StandaloneSupport({ children }) {
  return (
    <main className="support-wrapper">
      <div className="bg-glow bg-glow-1"></div>
      <div className="bg-glow bg-glow-2"></div>
      
      {children}

      <style jsx>{`
        .support-wrapper {
          min-height: 100vh;
          width: 100%;
          background-color: var(--background);
          padding: 1.5rem 2rem;
          position: relative;
          display: flex;
          align-items: center;
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

        @media (max-width: 768px) {
          .support-wrapper {
            padding: 4rem 1.5rem;
            align-items: flex-start;
            height: 100vh;
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
          }
        }
      `}</style>
    </main>
  );
}
