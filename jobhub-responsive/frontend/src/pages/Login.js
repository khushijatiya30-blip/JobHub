// pages/Login.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form,    setForm]    = useState({ email: '', password: '' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res  = await authAPI.login(form);
      // ✅ FIX 8: res.data.data — ApiResponse wrapper check karo
      const data = res.data?.data || res.data;

      if (!data || !data.token) {
        setError('Login failed: Server ne token nahi diya. Backend check karo.');
        return;
      }

      login(data);

      // Role ke hisaab se redirect karo
      if (data.role === 'STUDENT')      navigate('/student/dashboard');
      else if (data.role === 'COMPANY') navigate('/company/dashboard');
      else if (data.role === 'ADMIN')   navigate('/admin/dashboard');
      else {
        setError('Unknown role: ' + data.role);
      }
    } catch (err) {
      // ✅ FIX 9: Clear error messages — exact reason dikhao
      if (err.response) {
        const msg = err.response.data?.message || err.response.data?.error || 'Login failed.';
        const status = err.response.status;
        if (status === 401) {
          setError('❌ Wrong email or password. Check karo aur dobara try karo.');
        } else if (status === 403) {
          setError('❌ Access denied. Aapka account approved nahi hai.');
        } else if (status === 0 || !err.response) {
          setError('❌ Backend server chal nahi raha. `mvn spring-boot:run` run karo.');
        } else {
          setError('❌ ' + msg);
        }
      } else if (err.request) {
        setError('❌ Backend se connection nahi ho raha. Backend server start hai? Port 8080 pe chal raha hai?');
      } else {
        setError('❌ ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-circle">🎓</div>
          <h1>JobHub</h1>
          <p>Your Gateway to Great Careers</p>
        </div>

        {error && (
          <div className="alert alert-error" style={{ fontSize: 13, lineHeight: 1.5 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              name="email" type="email"
              className="form-control"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              name="password" type="password"
              className="form-control"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? '⏳ Signing in…' : '🔐 Sign In'}
          </button>
        </form>

        <hr className="divider" />

        <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register">Register here</Link>
        </p>


      </div>
    </div>
  );
}
