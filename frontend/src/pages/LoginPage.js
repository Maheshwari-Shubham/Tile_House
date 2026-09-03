import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { userLogin } from '../utils/api';
import { useUser } from '../context/UserContext';
import PasswordVisibilityIcon from '../components/PasswordVisibilityIcon';
import './AuthPage.css';

export default function LoginPage() {
  const [form, setForm]     = useState({ phone: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useUser();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from = location.state?.from || '/';

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      if (value && !/^[0-9]*$/.test(value)) return;
      if (value.length === 1 && /^[0-5]/.test(value)) return;
    }
    setForm(f => ({ ...f, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.phone || !form.password) { setError('Enter mobile number and password'); return; }
    if (!/^[6-9][0-9]{9}$/.test(form.phone)) { setError('Enter valid 10-digit mobile number'); return; }
    setLoading(true);
    try {
      const res = await userLogin({ phone: form.phone, password: form.password });
      login(res.data.user, res.data.token);
      navigate(from);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <img src="/favicon.svg" alt="Tile House logo" className="auth-logo-mark" />
          <span>Tile House</span>
        </div>
        <h2>Welcome Back</h2>
        <p>Login to view your orders and track deliveries</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="auth-group">
            <label>Mobile Number</label>
            <input name="phone" value={form.phone} onChange={handleChange}
              placeholder="10-digit number (starts 6–9)" maxLength={10} />
          </div>
          <div className="auth-group">
            <label>Password</label>
            <div className="password-input-wrap">
              <input name="password" type={showPassword ? 'text' : 'password'} value={form.password}
                onChange={handleChange} placeholder="Enter your password" />
              <button type="button" className="password-toggle" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                <PasswordVisibilityIcon hidden={!showPassword} />
              </button>
            </div>
          </div>
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login →'}
          </button>
        </form>

        <div className="auth-alt">
          New customer? <Link to="/register">Create Account</Link>
        </div>
        <div className="auth-alt">
          <Link to="/">← Continue as Guest</Link>
        </div>
      </div>
    </div>
  );
}
