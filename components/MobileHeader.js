'use client';

import { useState } from 'react';
import { Menu, X, Terminal } from 'lucide-react';
import Link from 'next/link';

export default function MobileHeader({ sidebar: SidebarComponent }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <header className="mobile-header glass-panel visible-mobile">
        <div className="flex items-center justify-between" style={{ padding: '0.75rem 1rem' }}>
          <Link href="/dashboard" className="flex items-center gap-2" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="logo-icon-small">
              <Terminal size={18} className="text-primary" />
            </div>
            <span className="font-bold" style={{ fontSize: '0.9rem' }}>SSI Portal</span>
          </Link>
          
          <button 
            className="menu-toggle"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle Menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Drawer Overlay */}
      {isOpen && (
        <div 
          className="mobile-drawer-overlay"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="mobile-drawer-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end p-4">
               <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white' }}>
                 <X size={24} />
               </button>
            </div>
            <div onClick={() => setIsOpen(false)}>
              <SidebarComponent />
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .mobile-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          border-radius: 0;
          border-top: none;
          border-left: none;
          border-right: none;
        }

        .logo-icon-small {
          background: rgba(16, 185, 129, 0.1);
          padding: 0.35rem;
          border-radius: var(--radius-sm);
        }

        .menu-toggle {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mobile-drawer-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(4px);
          z-index: 2000;
          display: flex;
        }

        .mobile-drawer-content {
          width: 280px;
          height: 100%;
          background: var(--background);
          box-shadow: 10px 0 30px rgba(0, 0, 0, 0.5);
          display: flex;
          flex-direction: column;
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }

        :global(.mobile-drawer-content .sidebar) {
          display: flex !important;
          width: 100% !important;
          border: none !important;
          height: 100%;
        }
      `}</style>
    </>
  );
}
