'use client';

import { useState, useEffect } from 'react';
import { Save, Server, KeyRound, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useModal } from '@/lib/contexts/ModalContext';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showAlert } = useModal();

  const [smtp, setSmtp] = useState({ host: '', port: '', user: '', pass: '', from: '' });
  const [showSmtpPass, setShowSmtpPass] = useState(false);
  
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [showAdminPass, setShowAdminPass] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/settings');
      if (!res.ok) throw new Error('Failed to fetch settings');
      const data = await res.json();
      setSmtp(data.smtp || { host: '', port: '', user: '', pass: '', from: '' });
    } catch (err) {
      showAlert('Error', err.message, 'DANGER');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        smtp: {
           host: smtp.host,
           port: smtp.port,
           user: smtp.user,
           pass: smtp.pass,
           from: smtp.from
        }
      };

      if (newAdminPassword.trim() !== '') {
        payload.newAdminPassword = newAdminPassword;
      }

      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save settings');
      }

      showAlert('Success', 'Settings successfully updated! The new configuration is now live.', 'SUCCESS');
      setNewAdminPassword(''); // clear new password field after saving

    } catch (error) {
      showAlert('Error', error.message, 'DANGER');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
     return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <Loader2 className="animate-spin" size={32} color="var(--primary)" />
          <p style={{ marginTop: '1rem', color: 'var(--primary)', fontWeight: 'bold' }}>Loading Settings...</p>
        </div>
     );
  }

  return (
    <div>
      <div className="admin-header pb-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '2rem' }}>
        <div>
          <h1 className="text-gradient">Platform Settings</h1>
          <p style={{ color: 'var(--border)' }}>Configure global MongoDB preferences for dynamic credential injection.</p>
        </div>
      </div>

      <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
        
        {/* Administrator Credential Block */}
        <div className="glass-panel" style={{ padding: '2rem', height: 'fit-content' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: 'white', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
             <KeyRound size={20} color="var(--primary)" /> Administrator Access
          </h3>
          
          <div style={{ marginBottom: '1.5rem' }}>
             <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--border)', marginBottom: '0.5rem', fontWeight: 'bold' }}>Admin Identity Email</label>
             <input 
               type="email" 
               value="admin@studysmart.com" 
               disabled 
               style={{ width: '100%', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '0.5rem', color: 'rgba(255,255,255,0.5)', cursor: 'not-allowed' }}
             />
             <p style={{ fontSize: '0.75rem', color: 'var(--border)', marginTop: '0.5rem' }}>The primary login identifier is hardcoded for core system stability.</p>
          </div>

          <div>
             <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--border)', marginBottom: '0.5rem', fontWeight: 'bold' }}>Change Password</label>
             <div style={{ position: 'relative' }}>
                <input 
                  type={showAdminPass ? "text" : "password"} 
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  placeholder="Enter new password to update..." 
                  style={{ width: '100%', padding: '0.75rem 1rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', color: 'white', outline: 'none' }}
                />
                <button 
                   type="button"
                   onClick={() => setShowAdminPass(!showAdminPass)}
                   style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--border)', cursor: 'pointer' }}
                >
                   {showAdminPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
             </div>
             <p style={{ fontSize: '0.75rem', color: 'var(--border)', marginTop: '0.5rem' }}>Leave blank to keep your current password.</p>
          </div>
        </div>

        {/* SMTP Details Block */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: 'white', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
             <Server size={20} color="var(--primary)" /> SMTP Delivery Configuration
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
             <div>
                <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--border)', marginBottom: '0.5rem', fontWeight: 'bold' }}>SMTP Host</label>
                <input 
                  type="text" 
                  value={smtp.host} 
                  onChange={(e) => setSmtp({...smtp, host: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem 1rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', color: 'white', outline: 'none' }}
                />
             </div>
             <div>
                <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--border)', marginBottom: '0.5rem', fontWeight: 'bold' }}>Port</label>
                <input 
                  type="number" 
                  value={smtp.port} 
                  onChange={(e) => setSmtp({...smtp, port: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem 1rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', color: 'white', outline: 'none' }}
                />
             </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
             <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--border)', marginBottom: '0.5rem', fontWeight: 'bold' }}>Sent From Email (Sender Identity)</label>
             <input 
               type="email" 
               value={smtp.from} 
               onChange={(e) => setSmtp({...smtp, from: e.target.value})}
               style={{ width: '100%', padding: '0.75rem 1rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', color: 'white', outline: 'none' }}
             />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
             <div>
                <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--border)', marginBottom: '0.5rem', fontWeight: 'bold' }}>SMTP User</label>
                <input 
                  type="text" 
                  value={smtp.user} 
                  onChange={(e) => setSmtp({...smtp, user: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem 1rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', color: 'white', outline: 'none' }}
                />
             </div>
             <div>
                <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--border)', marginBottom: '0.5rem', fontWeight: 'bold' }}>SMTP Password</label>
                <div style={{ position: 'relative' }}>
                   <input 
                     type={showSmtpPass ? "text" : "password"} 
                     value={smtp.pass} 
                     onChange={(e) => setSmtp({...smtp, pass: e.target.value})}
                     style={{ width: '100%', padding: '0.75rem 1rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', color: 'white', outline: 'none' }}
                   />
                   <button 
                      type="button"
                      onClick={() => setShowSmtpPass(!showSmtpPass)}
                      style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--border)', cursor: 'pointer' }}
                   >
                      {showSmtpPass ? <EyeOff size={18} /> : <Eye size={18} />}
                   </button>
                </div>
             </div>
          </div>
        </div>

        {/* Save Bar */}
        <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
           <button 
             type="submit"
             disabled={saving}
             style={{ 
                display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 3rem', borderRadius: '0.5rem', border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
                background: saving ? 'rgba(255,255,255,0.1)' : 'var(--primary)', color: 'white', fontWeight: 'bold', fontSize: '1rem', transition: 'all 0.2s'
             }}
           >
              {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} 
              {saving ? 'Syncing...' : 'Save Configuration'}
           </button>
        </div>

      </form>
    </div>
  );
}
