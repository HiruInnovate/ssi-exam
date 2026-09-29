'use client';

import { useModal } from '@/lib/contexts/ModalContext';
import { AlertTriangle, Info, CheckCircle, X } from 'lucide-react';

export default function Modal() {
  const { modalConfig } = useModal();

  if (!modalConfig) return null;

  const { title, message, type, showCancel, onConfirm, onCancel } = modalConfig;

  const getIcon = () => {
    switch (type) {
      case 'DANGER': return <AlertTriangle size={32} className="text-danger" />;
      case 'SUCCESS': return <CheckCircle size={32} className="text-success" />;
      default: return <Info size={32} className="text-primary" />;
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container glass-panel animate-in shadow-2xl">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
             {getIcon()}
             <h2 className="modal-title">{title}</h2>
          </div>
          <button onClick={onCancel} className="close-btn"><X size={20} /></button>
        </div>
        
        <div className="modal-content mb-8">
          <p>{message}</p>
        </div>

        <div className="flex justify-end gap-4 mt-auto">
          {showCancel && (
            <button className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
          )}
          <button 
            className={`btn ${type === 'DANGER' ? 'btn-danger' : 'btn-primary'}`} 
            onClick={onConfirm}
          >
            {type === 'DANGER' ? 'Confirm Action' : 'OK'}
          </button>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 1.5rem;
        }

        .modal-container {
          width: 100%;
          max-width: 500px;
          padding: 2rem;
          background: rgba(18, 18, 20, 0.95);
          border: 1px solid var(--border);
          position: relative;
        }

        .modal-title {
          margin: 0;
          font-size: 1.5rem;
          color: var(--foreground);
        }

        .modal-content {
          color: var(--border);
          line-height: 1.6;
          font-size: 1.05rem;
        }

        .close-btn {
          background: none;
          border: none;
          color: var(--border);
          cursor: pointer;
          padding: 0.2rem;
        }

        .animate-in {
          animation: scale-up 0.2s cubic-bezier(0, 0.5, 0.5, 1);
        }

        @keyframes scale-up {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
