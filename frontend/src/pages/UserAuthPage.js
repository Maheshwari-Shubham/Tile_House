import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { userLogin, userRegister } from '../utils/api';
import { useUser } from '../context/UserContext';
import './UserAuthPage.css';

export default function UserAuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useUser();
  const [mode, setMode] = useState(location.state?.mode || 'login'); // 'login' | 'register'

  const [form, setForm] = useState({ name:'', phone:'', email:'', password:'', confirmPassword:'' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const redirectTo = location.state?.redirectTo || '/my-orders';

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      if (value && !/^[0-9]*$/.test(value)) return;
      if (value.length === 1 && /^[0-5]/.test(value)) return;
    }
    setForm(f => ({ ...f, [name]: value }));
    setErrors(err => ({ ...err, [name]: '' }));
    setServerError('');
  };

  const validateLogin = () => {
    const e = {};
    if (!/^[6-9][0-9]{9}$/.test(form.phone)) e.phone = 'Enter valid 10-digit mobile number (starts 6–9)';
    if (!form.password) e.password = 'Enter your password';
    return e;
  };

  const validateRegister = () => {
    const e = {};
    if (!form.name.trim() || form.name.trim().length < 2) e.name = 'Enter your full name';
    if (!/^[6-9][0-9]{9}$/.test(form.phone)) e.phone = 'Enter valid 10-digit mobile number (starts 6–9)';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter valid email address';
    if (!form.password || form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async () => {
    const e = mode === 'login' ? validateLogin() : validateRegister();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    setLoading(true); setServerError('');
    try {
      const fn = mode === 'login' ? userLogin : userRegister;
      const res = await fn(form);
      login(res.data.user, res.data.token);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setServerError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <img src="/favicon.svg" alt="Tile House logo" className="auth-logo-mark" />
          <span>Tile House</span>
        </div>

        <div className="auth-tabs">
          <button className={mode === 'login' ? 'active' : ''} onClick={() => { setMode('login'); setErrors({}); setServerError(''); }}>
            Sign In
          </button>
          <button className={mode === 'register' ? 'active' : ''} onClick={() => { setMode('register'); setErrors({}); setServerError(''); }}>
            Create Account
          </button>
        </div>

        {serverError && <div className="auth-error">{serverError}</div>}

        <div className="auth-form">
          {mode === 'register' && (
            <div className="auth-group">
              <label>Full Name *</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Gurpreet Singh" />
              {errors.name && <span className="auth-field-error">{errors.name}</span>}
            </div>
          )}

          <div className="auth-group">
            <label>Mobile Number *</label>
            <input name="phone" value={form.phone} onChange={handleChange} placeholder="10-digit number starting with 6–9" maxLength={10} />
            {errors.phone && <span className="auth-field-error">{errors.phone}</span>}
          </div>

          {mode === 'register' && (
            <div className="auth-group">
              <label>Email <span className="optional">(Optional — for order notifications)</span></label>
              <input name="email" value={form.email} onChange={handleChange} placeholder="yourname@gmail.com" type="email" />
              {errors.email && <span className="auth-field-error">{errors.email}</span>}
            </div>
          )}

          <div className="auth-group">
            <label>Password *</label>
            <input name="password" value={form.password} onChange={handleChange} placeholder={mode === 'register' ? 'Min 6 characters' : 'Enter your password'} type="password" />
            {errors.password && <span className="auth-field-error">{errors.password}</span>}
          </div>

          {mode === 'register' && (
            <div className="auth-group">
              <label>Confirm Password *</label>
              <input name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Re-enter password" type="password" />
              {errors.confirmPassword && <span className="auth-field-error">{errors.confirmPassword}</span>}
            </div>
          )}

          <button className="auth-submit-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </div>

        <p className="auth-switch">
          {mode === 'login'
            ? <>New here? <button onClick={() => setMode('register')}>Create account</button></>
            : <>Already have an account? <button onClick={() => setMode('login')}>Sign in</button></>
          }
        </p>

        <p className="auth-guest-note">
          You can also <a href="/checkout">checkout as guest</a> without creating an account.
        </p>
      </div>
    </div>
  );
}
