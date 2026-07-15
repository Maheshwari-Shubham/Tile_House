import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../../utils/api';
import './AdminLogin.css';

export default function AdminLogin() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); 
    setError('');
    try {
      const res = await adminLogin(form);
      if (res.data && res.data.token) {
        localStorage.setItem('adminToken', res.data.token);
        localStorage.setItem('adminUser', res.data.username);
        navigate('/admin');
      } else {
        setError('Invalid response from server');
        console.error('Login response missing token:', res.data);
      }
    } catch (err) {
      console.error('Admin login error:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Invalid username or password');
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="admin-login-page">
      <div className="login-card">
        <div className="login-logo">
          <img src="/favicon.svg" alt="Tile House logo" className="login-logo-mark" />
          <span>Tile House</span>
        </div>
        <h2>Admin Panel</h2>
        <p>Sign in to manage products, orders & offers</p>
        {error && <div className="login-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="lg-group">
            <label>Username</label>
            <input
              type="text" value={form.username} autoComplete="username"
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              placeholder="admin"
            />
          </div>
          <div className="lg-group">
            <label>Password</label>
            <input
              type="password" value={form.password} autoComplete="current-password"
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div className="login-hint">Default: admin / admin123</div>
      </div>
    </div>
  );
}
