'use client';

import { Rocket, FileText, Users, Briefcase, ChevronRight, Sparkles } from 'lucide-react';

export default function CareerHubPage() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '3rem' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '70px', height: '70px', borderRadius: '50%', background: 'var(--accent)', color: 'white', marginBottom: '1rem', boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)' }}>
          <Rocket size={36} />
        </div>
        <h1 className="text-gradient">Career Launchpad</h1>
        <p style={{ color: 'var(--border)', fontSize: '1.1rem' }}>
          Welcome to the hub! Equip yourself with modern strategies to stand out in the GenZ professional landscape. 🎯
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Section 1: LinkedIn Mastery */}
        <div className="hub-card">
          <div className="hub-header" style={{ background: 'linear-gradient(45deg, #0a66c2 0%, #004182 100%)' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            <h2>LinkedIn Mastery 🚀</h2>
          </div>
          <div className="hub-content">
            <details className="trendy-accordion">
              <summary>How to craft a stunning profile hook?</summary>
              <div className="accordion-body">
                <p>Don't just put "Student at XYZ College". Recruiters skim profiles in 3 seconds. Instead, write a hook that shows your trajectory:</p>
                <ul>
                  <li>✅ <em>"Software Engineering Student | Python & Java | Building Scalable React Web Apps"</em></li>
                  <li>✅ <em>"Aspiring Data Analyst | 3x Hackathon Winner | C++ Enthusiast"</em></li>
                </ul>
                <p><strong>Pro-tip:</strong> Always use a high-quality banner image that relates to your field, not just the default gray background!</p>
              </div>
            </details>
            <details className="trendy-accordion">
              <summary>How to post content that actually gets views?</summary>
              <div className="accordion-body">
                <p>The LinkedIn algorithm loves formatting and stories. When you finish a project or get a certification (like this one!), follow this formula:</p>
                <ol>
                  <li><strong>The Hook:</strong> "I just spent the last 30 days learning X, and here's what I built..."</li>
                  <li><strong>The Body:</strong> Use ample whitespace. One sentence per line. Emojis strictly for bullet points.</li>
                  <li><strong>The Proof:</strong> Attach the certificate image, a video demo, or a Github link. Rich media boosts reach by 400%.</li>
                </ol>
              </div>
            </details>
          </div>
        </div>

        {/* Section 2: The Golden Resume */}
        <div className="hub-card">
          <div className="hub-header" style={{ background: 'linear-gradient(45deg, #10b981 0%, #047857 100%)' }}>
            <FileText size={28} />
            <h2>The Golden Resume ⚡</h2>
          </div>
          <div className="hub-content">
            <details className="trendy-accordion">
              <summary>Beating the ATS (Applicant Tracking System)</summary>
              <div className="accordion-body">
                <p>75% of resumes are never seen by a human because they fail the robot scan. How to survive?</p>
                <ul>
                  <li><strong>No images or crazy columns:</strong> Use a standard single-column format. Bots can't read fancy Canva graphic resumes easily.</li>
                  <li><strong>Keyword Matching:</strong> If the job asks for "TypeScript" and "Object-Oriented Design", make sure those exact words exist in your skills section.</li>
                  <li><strong>Export as PDF:</strong> Always export as PDF to preserve layout, but ensure the text is selectable (not a flattened image).</li>
                </ul>
              </div>
            </details>
            <details className="trendy-accordion">
              <summary>The "XYZ" Bullet Point Formula</summary>
              <div className="accordion-body">
                <p>Never write: <em>"Fixed bugs"</em> or <em>"Helped build a website"</em>. Use Google's legendary XYZ formula: <strong>"Accomplished [X] as measured by [Y], by doing [Z]."</strong></p>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid var(--accent)', margin: '1rem 0' }}>
                  <em>"Reduced application load time by 40% (X) resulting in higher user retention (Y) by implementing lazy loading in React (Z)."</em>
                </div>
              </div>
            </details>
          </div>
        </div>

        {/* Section 3: Acing the HR Round */}
        <div className="hub-card">
          <div className="hub-header" style={{ background: 'linear-gradient(45deg, #f59e0b 0%, #b45309 100%)' }}>
            <Users size={28} />
            <h2>Acing the HR Round 🎭</h2>
          </div>
          <div className="hub-content">
            <details className="trendy-accordion">
              <summary>"Tell me about yourself" (The Trap)</summary>
              <div className="accordion-body">
                <p>They don't want to hear your life story from childhood. They want a professional reel. Use the <strong>Present-Past-Future</strong> framework:</p>
                <ul>
                  <li><strong>Present:</strong> "I'm currently a senior specializing in Java development."</li>
                  <li><strong>Past:</strong> "Previously, I built an exam portal and completed my SSI certification."</li>
                  <li><strong>Future:</strong> "I'm looking to bring my backend skills to a fast-scaling tech team like yours."</li>
                </ul>
              </div>
            </details>
            <details className="trendy-accordion">
              <summary>"What is your biggest weakness?"</summary>
              <div className="accordion-body">
                <p>Don't use fake weaknesses like "I work too hard" or "I'm a perfectionist". HR will roll their eyes. Pick a <strong>real</strong> technical or soft skill you lacked, and immediately show how you fixed it.</p>
                <p><em>Example:</em> "I used to struggle with Git version control when working in large teams. To fix this, I recently took a dedicated course on Git workflows and now successfully manage branching for my open-source projects."</p>
              </div>
            </details>
          </div>
        </div>
        
      </div>

      <style jsx>{`
        .hub-card {
          background: #1e293b;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.05);
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          transition: transform 0.3s ease;
        }
        .hub-card:hover {
          transform: translateY(-5px);
          border-color: rgba(255,255,255,0.1);
        }
        .hub-header {
          padding: 1.5rem 2rem;
          color: white;
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .hub-header h2 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
        }
        .hub-content {
          padding: 1rem 2rem 2rem 2rem;
        }
        
        .trendy-accordion {
          margin-top: 1rem;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          padding-bottom: 0.5rem;
        }
        .trendy-accordion summary {
          padding: 1rem 0;
          cursor: pointer;
          font-weight: 500;
          font-size: 1.1rem;
          color: var(--foreground);
          list-style: none; /* Hide default arrow */
          position: relative;
          transition: color 0.2s ease;
        }
        .trendy-accordion summary::-webkit-details-marker {
          display: none;
        }
        .trendy-accordion summary:hover {
          color: var(--primary);
        }
        .trendy-accordion summary::after {
          content: '+';
          position: absolute;
          right: 0;
          font-size: 1.5rem;
          font-weight: 300;
          transition: transform 0.3s ease;
        }
        .trendy-accordion[open] summary::after {
          content: '−';
          color: var(--accent);
        }
        .accordion-body {
          padding: 0 0 1.5rem 0;
          color: #a1a1aa; /* Light gray text */
          line-height: 1.7;
          animation: fadein 0.4s ease-out;
        }
        .accordion-body ul, .accordion-body ol {
          padding-left: 1.5rem;
          margin-top: 0.5rem;
          margin-bottom: 1rem;
        }
        .accordion-body li {
          margin-bottom: 0.5rem;
        }
        
        @keyframes fadein {
          0% { opacity: 0; transform: translateY(-10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        @media (max-width: 640px) {
          .hub-header {
            padding: 1rem 1.25rem;
            flex-direction: column;
            text-align: center;
          }
          .hub-header h2 {
            font-size: 1.25rem;
          }
          .hub-content {
            padding: 1rem 1.25rem 1.5rem 1.25rem;
          }
          .trendy-accordion summary {
            font-size: 1rem;
            padding-right: 2rem;
          }
          .accordion-body {
            font-size: 0.9rem;
          }
        }
      `}</style>
    </div>
  );
}
