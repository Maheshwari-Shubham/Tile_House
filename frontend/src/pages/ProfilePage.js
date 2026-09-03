import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { updateUserProfile } from '../utils/api';
import './AuthPage.css';

export default function ProfilePage() {
  const { user, isLoggedIn, logout, updateUser } = useUser();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name:  user?.name  || '',
    email: user?.email || '',
  });
  const [success, setSuccess] = useState('');
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwdForm, setShowPwdForm] = useState(false);
  const [pwd, setPwd] = useState({ current: '', newPwd: '', confirm: '' });
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');

  if (!isLoggedIn) { navigate('/login'); return null; }

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError(''); setSuccess('');
  };

  const handleSave = async () => {
    if (!form.name.trim() || form.name.trim().length < 2) { setError('Enter your full name (min 2 characters)'); return; }
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) { setError('Enter a valid email address'); return; }
    setLoading(true);
    try {
      const res = await updateUserProfile({ name: form.name.trim(), email: form.email.trim() });
      updateUser(res.data);
      setSuccess('✓ Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{maxWidth:480, textAlign:'left'}}>
        <div className="auth-logo" style={{textAlign:'center'}}>
          <img src="/favicon.svg" alt="Tile House logo" className="auth-logo-mark" />
          <span>Tile House</span>
        </div>
        <h2 style={{textAlign:'center',marginBottom:4}}>My Profile</h2>
        <p style={{textAlign:'center',color:'var(--text-light)',marginBottom:28,fontSize:14}}>
          📞 {user?.phone} <span style={{color:'#ccc',margin:'0 8px'}}>|</span> Edit your details below
        </p>

        {/* Profile Details */}
        {error   && <div className="auth-error">{error}</div>}
        {success && <div style={{background:'#E8F5E9',color:'#2E7D32',borderRadius:8,padding:'10px 14px',fontSize:14,marginBottom:18}}>{success}</div>}

        <div className="auth-group">
          <label>Full Name *</label>
          <input name="name" value={form.name} onChange={handleChange} placeholder="Your full name" />
        </div>
        <div className="auth-group">
          <label>Mobile Number <small style={{fontWeight:400,color:'var(--text-light)'}}>(cannot be changed)</small></label>
          <input value={user?.phone || ''} disabled style={{background:'#f5f5f5',color:'#999',cursor:'not-allowed'}} />
        </div>
        <div className="auth-group">
          <label>Email <small style={{fontWeight:400,color:'var(--text-light)'}}>(for order notifications)</small></label>
          <input name="email" value={form.email} onChange={handleChange} placeholder="yourname@gmail.com" type="email" />
        </div>

        <button className="auth-btn" onClick={handleSave} disabled={loading}>
          {loading ? 'Saving...' : 'Save Profile'}
        </button>

        <div style={{borderTop:'1px solid var(--border)',margin:'24px 0'}} />

        {/* Quick links */}
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          <button className="auth-btn" style={{background:'var(--bg2)',color:'var(--primary)',border:'1.5px solid var(--primary)'}}
            onClick={()=>navigate('/my-orders')}>
            📦 View My Orders
          </button>
          <button className="auth-btn" style={{background:'none',color:'var(--danger)',border:'1.5px solid var(--danger)'}}
            onClick={()=>{ logout(); navigate('/'); }}>
            🚪 Logout
          </button>
        </div>

        {pwdError   && <div className="auth-error" style={{marginTop:12}}>{pwdError}</div>}
        {pwdSuccess && <div style={{background:'#E8F5E9',color:'#2E7D32',borderRadius:8,padding:'10px 14px',fontSize:14,marginTop:12}}>{pwdSuccess}</div>}
      </div>
    </div>
  );
}
