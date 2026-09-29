'use client';

import { useState } from 'react';
import { User, Phone, Lock, Save, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useModal } from '@/lib/contexts/ModalContext';

export default function SettingsForm({ initialData }) {
  const { showAlert } = useModal();
  const [profileData, setProfileData] = useState({
    name: initialData.name,
    phone: initialData.phone
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoadingProfile(true);
    try {
      const res = await fetch('/api/student/settings/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });
      const data = await res.json();
      if (res.ok) {
        showAlert('Success', 'Profile updated successfully', 'SUCCESS');
      } else {
        showAlert('Error', data.error || 'Failed to update profile', 'DANGER');
      }
    } catch (err) {
      showAlert('Error', 'Connection error', 'DANGER');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showAlert('Error', 'New passwords do not match', 'DANGER');
      return;
    }
    setLoadingPassword(true);
    try {
      const res = await fetch('/api/student/settings/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });
      const data = await res.json();
      if (res.ok) {
        showAlert('Success', 'Password changed successfully', 'SUCCESS');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        showAlert('Error', data.error || 'Failed to update password', 'DANGER');
      }
    } catch (err) {
      showAlert('Error', 'Connection error', 'DANGER');
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Profile Section */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div className="flex items-center gap-2 mb-6" style={{ color: 'var(--primary)' }}>
          <User size={20} />
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Profile Information</h2>
        </div>

        <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4">
          <div className="input-group">
            <label>Email Address (Primary ID)</label>
            <input 
              type="text" 
              value={initialData.email} 
              disabled 
              style={{ opacity: 0.5, cursor: 'not-allowed' }}
            />
            <p style={{ fontSize: '0.75rem', opacity: 0.5, marginTop: '0.25rem' }}>Email cannot be changed as it is your account identifier.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="input-group">
              <label>Full Name</label>
              <input 
                type="text" 
                value={profileData.name}
                onChange={(e) => setProfileData(p => ({ ...p, name: e.target.value }))}
                required 
              />
            </div>
            <div className="input-group">
              <label>Phone Number</label>
              <input 
                type="text" 
                value={profileData.phone}
                onChange={(e) => setProfileData(p => ({ ...p, phone: e.target.value }))}
                required 
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loadingProfile} style={{ alignSelf: 'flex-start', marginTop: '1rem' }}>
            <Save size={18} />
            <span>{loadingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
          </button>
        </form>
      </div>

      {/* Password Section */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div className="flex items-center gap-2 mb-6" style={{ color: 'var(--primary)' }}>
          <ShieldCheck size={20} />
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Security & Password</h2>
        </div>

        <form onSubmit={handleUpdatePassword} className="flex flex-col gap-4">
          <div className="input-group">
            <label>Current Password</label>
            <div className="password-input-wrapper">
              <input 
                type={showCurrentPassword ? "text" : "password"} 
                placeholder="••••••••"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData(p => ({ ...p, currentPassword: e.target.value }))}
                required 
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="input-group">
              <label>New Password</label>
              <div className="password-input-wrapper">
                <input 
                  type={showNewPassword ? "text" : "password"} 
                  placeholder="••••••••"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(p => ({ ...p, newPassword: e.target.value }))}
                  required 
                />
                <button 
                  type="button" 
                  className="password-toggle"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="input-group">
              <label>Confirm New Password</label>
              <div className="password-input-wrapper">
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  placeholder="••••••••"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(p => ({ ...p, confirmPassword: e.target.value }))}
                  required 
                />
                <button 
                  type="button" 
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loadingPassword} style={{ alignSelf: 'flex-start', marginTop: '1rem' }}>
            <Lock size={18} />
            <span>{loadingPassword ? 'Updating...' : 'Change Password'}</span>
          </button>
        </form>
      </div>

      <style jsx>{`
        .input-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .input-group label {
          font-size: 0.875rem;
          font-weight: 500;
          opacity: 0.8;
        }
        input {
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-md);
          color: white;
          outline: none;
        }
        input:focus:not(:disabled) {
          border-color: var(--primary);
          background: rgba(255, 255, 255, 0.08);
        }
        .password-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .password-input-wrapper input {
          width: 100%;
          padding-right: 3rem;
        }
        .password-toggle {
          position: absolute;
          right: 0.75rem;
          background: none;
          border: none;
          color: white;
          opacity: 0.5;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: 0.2s opacity;
        }
        .password-toggle:hover {
          opacity: 1;
        }
        .grid {
          display: grid;
        }
        .grid-cols-2 {
          grid-template-columns: 1fr 1fr;
        }
        .gap-4 {
          gap: 1rem;
        }
        @media (max-width: 640px) {
          .grid-cols-2 {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
