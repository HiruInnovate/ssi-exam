'use client';

import { useState } from 'react';
import { MessageCircle, Share2, CheckCircle2 } from 'lucide-react';

export default function ShareButtons({ examTitle, certificateUrl }) {
  const [copied, setCopied] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const getFullUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}${certificateUrl}`;
    }
    return certificateUrl;
  };

  const shareText = `I am thrilled to announce that I've successfully passed the ${examTitle} certification from Study Smart Innovations! 🚀`;

  const handleShare = (platform) => {
    const url = encodeURIComponent(getFullUrl());
    const text = encodeURIComponent(shareText);

    let shareUrl = '';
    
    switch (platform) {
      case 'linkedin':
        // LinkedIn share URL format
        shareUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${text} ${url}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'whatsapp':
        shareUrl = `https://api.whatsapp.com/send?text=${text} ${url}`;
        break;
      case 'instagram':
        // Copy to clipboard for IG
        navigator.clipboard.writeText(`${shareText}\\n\\n#StudySmartInnovations #${examTitle.replace(/\\s+/g, '')} #Certification`);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
        return; // Don't try to open a URL
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button 
        onClick={() => setShowOptions(!showOptions)}
        className="btn"
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          background: 'rgba(139, 92, 246, 0.1)', 
          color: 'var(--accent)', 
          border: '1px solid var(--accent)',
          padding: '0.4rem 0.8rem',
          fontSize: '0.85rem'
        }}
      >
        <Share2 size={16} /> Share
      </button>

      {showOptions && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '0.5rem',
          background: '#1e293b',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px',
          padding: '0.5rem',
          display: 'flex',
          gap: '0.5rem',
          zIndex: 50,
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          minWidth: 'max-content'
        }}>
          <button onClick={() => handleShare('linkedin')} title="Share to LinkedIn" style={{ background: '#0a66c2', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer', display: 'flex' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
          </button>
          <button onClick={() => handleShare('twitter')} title="Share to X (Twitter)" style={{ background: '#000000', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer', display: 'flex' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </button>
          <button onClick={() => handleShare('whatsapp')} title="Share to WhatsApp" style={{ background: '#25d366', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer', display: 'flex' }}>
            <MessageCircle size={18} />
          </button>
          <button onClick={() => handleShare('facebook')} title="Share to Facebook" style={{ background: '#1877f2', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer', display: 'flex' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
          </button>
          <button onClick={() => handleShare('instagram')} title="Copy Instagram Caption" style={{ background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer', display: 'flex', position: 'relative' }}>
            {copied ? <CheckCircle2 size={18} /> : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>}
          </button>
        </div>
      )}
    </div>
  );
}
