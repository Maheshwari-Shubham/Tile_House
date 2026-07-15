import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { userRegister } from '../utils/api';
import { useUser } from '../context/UserContext';
import './AuthPage.css';

export default function RegisterPage() {
  const [form, setForm]     = useState({ name: '', phone: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useUser();
  const navigate  = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      if (value && !/^[0-9]*$/.test(value)) return;
      if (value.length === 1 && /^[0-5]/.test(value)) return;
    }
    setForm(f => ({ ...f, [name]: value }));
    setErrors(err => ({ ...err, [name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim() || form.name.trim().length < 2) e.name = 'Enter your full name';
    if (!/^[6-9][0-9]{9}$/.test(form.phone)) e.phone = 'Enter valid 10-digit mobile number (starts 6–9)';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter valid email address';
    if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    try {
      const res = await userRegister({ name: form.name.trim(), phone: form.phone, email: form.email.trim(), password: form.password });
      login(res.data.user, res.data.token);
      navigate('/my-orders');
    } catch (err) {
      setErrors({ server: err.response?.data?.error || 'Registration failed. Please try again.' });
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <img src="/favicon.svg" alt="Tile House logo" className="auth-logo-mark" />
          <span>Tile House</span>
        </div>
        <h2>Create Account</h2>
        <p>Register to track your orders and get order updates</p>

        {errors.server && <div className="auth-error">{errors.server}</div>}

        <form onSubmit={handleSubmit}>
          <div className="auth-group">
            <label>Full Name *</label>
            <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Gurpreet Singh" />
            {errors.name && <span className="auth-field-error">{errors.name}</span>}
          </div>
          <div className="auth-group">
            <label>Mobile Number * <small>(used for login)</small></label>
            <input name="phone" value={form.phone} onChange={handleChange}
              placeholder="10-digit number (starts 6–9)" maxLength={10} />
            {errors.phone && <span className="auth-field-error">{errors.phone}</span>}
          </div>
          <div className="auth-group">
            <label>Email <small>(Optional — for order confirmations)</small></label>
            <input name="email" value={form.email} onChange={handleChange} placeholder="yourname@email.com" type="email" />
            {errors.email && <span className="auth-field-error">{errors.email}</span>}
          </div>
          <div className="auth-group">
            <label>Password * <small>(min 6 characters)</small></label>
            <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Create a password" />
            {errors.password && <span className="auth-field-error">{errors.password}</span>}
          </div>
          <div className="auth-group">
            <label>Confirm Password *</label>
            <input name="confirm" type="password" value={form.confirm} onChange={handleChange} placeholder="Re-enter password" />
            {errors.confirm && <span className="auth-field-error">{errors.confirm}</span>}
          </div>
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account →'}
          </button>
        </form>

        <div className="auth-alt">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
}
