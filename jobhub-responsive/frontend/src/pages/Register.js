// pages/Register.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [role,    setRole]    = useState('STUDENT');
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const [studentForm, setStudentForm] = useState({
    email: '', password: '', name: '', phone: '',
    branch: '', college: '', graduationYear: '', cgpa: '',
  });

  const [companyForm, setCompanyForm] = useState({
    email: '', password: '', companyName: '', gstNumber: '',
    cinNumber: '', industry: '', website: '', phone: '',
    city: '', state: '', address: '', currentAddress: '', description: '',
  });

  const handleStudent = e =>
    setStudentForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const handleCompany = e =>
    setCompanyForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      let res;
      if (role === 'STUDENT') {
        res = await authAPI.registerStudent({
          ...studentForm,
          cgpa: parseFloat(studentForm.cgpa),
          graduationYear: parseInt(studentForm.graduationYear),
        });
      } else {
        res = await authAPI.registerCompany(companyForm);
      }
      const data = res.data.data;
      login(data);

      if (data.role === 'STUDENT') navigate('/student/dashboard');
      else navigate('/company/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{ alignItems: 'flex-start', paddingTop: 40 }}>
      <div className="auth-card" style={{ maxWidth: 520 }}>
        <div className="auth-logo">
          <div className="logo-circle">🎓</div>
          <h1>Create Account</h1>
          <p>Join JobHub today</p>
        </div>

        {/* Role Tabs */}
        <div className="role-tabs">
          {['STUDENT', 'COMPANY'].map(r => (
            <div key={r} className={`role-tab ${role === r ? 'active' : ''}`}
              onClick={() => setRole(r)}>
              {r === 'STUDENT' ? '👨‍🎓 Student' : '🏢 Company'}
            </div>
          ))}
        </div>

        {error && <div className="alert alert-error"><span>⚠️</span> {error}</div>}

        <form onSubmit={handleSubmit}>
          {role === 'STUDENT' ? (
            <div className="profile-grid-2 register-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
              {[
                { name: 'name',           label: 'Full Name',       type: 'text',   span: 2 },
                { name: 'email',          label: 'Email',           type: 'email',  span: 2 },
                { name: 'password',       label: 'Password',        type: 'password', span: 2 },
                { name: 'phone',          label: 'Phone',           type: 'text' },
                { name: 'branch',         label: 'Branch',          type: 'text' },
                { name: 'college',        label: 'College',         type: 'text',   span: 2 },
                { name: 'graduationYear', label: 'Graduation Year', type: 'number' },
                { name: 'cgpa',           label: 'CGPA (0-10)',     type: 'number', step: '0.01' },
              ].map(f => (
                <div key={f.name} className="form-group"
                  style={{ gridColumn: f.span === 2 ? '1 / -1' : 'auto' }}>
                  <label className="form-label">{f.label}</label>
                  <input name={f.name} type={f.type} className="form-control"
                    value={studentForm[f.name]} onChange={handleStudent}
                    step={f.step} required={['name','email','password'].includes(f.name)} />
                </div>
              ))}
            </div>
          ) : (
            <div className="profile-grid-2 register-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
              {[
                { name: 'companyName',    label: 'Company Name',                         type: 'text',     span: 2 },
                { name: 'email',         label: 'Email',                                 type: 'email',    span: 2 },
                { name: 'password',      label: 'Password',                              type: 'password', span: 2 },
                { name: 'gstNumber',     label: 'GST Number (e.g. 22AAAAA0000A1Z5)',     type: 'text',     span: 2 },
                { name: 'cinNumber',     label: 'CIN Number (e.g. L12345MH2000PLC123456)', type: 'text',   span: 2 },
                { name: 'industry',      label: 'Industry',                              type: 'text' },
                { name: 'phone',         label: 'Phone',                                 type: 'text' },
                { name: 'website',       label: 'Website',                               type: 'url',      span: 2 },
                { name: 'city',          label: 'City',                                  type: 'text' },
                { name: 'state',         label: 'State',                                 type: 'text' },
                { name: 'address',       label: 'Main Location / Address',               type: 'text',     span: 2 },
                { name: 'currentAddress',label: 'Current Address',                       type: 'text',     span: 2 },
              ].map(f => (
                <div key={f.name} className="form-group"
                  style={{ gridColumn: f.span === 2 ? '1 / -1' : 'auto' }}>
                  <label className="form-label">{f.label}</label>
                  <input name={f.name} type={f.type} className="form-control"
                    value={companyForm[f.name]} onChange={handleCompany}
                    required={['companyName','email','password','gstNumber'].includes(f.name)} />
                </div>
              ))}
              {/* Description textarea */}
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Company Description</label>
                <textarea name="description" className="form-control" rows={3}
                  placeholder="Company ke baare mein brief description likhein…"
                  value={companyForm.description} onChange={handleCompany} />
              </div>
              {role === 'COMPANY' && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <div className="alert alert-info">
                    ℹ️ After registration, please upload your company logo &amp; certificate from your dashboard.
                    Admin approval required before posting jobs.
                  </div>
                </div>
              )}
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: 8 }} disabled={loading}>
            {loading ? <span className="spin">⏳</span> : '✅'} &nbsp;
            {loading ? 'Registering…' : 'Create Account'}
          </button>
        </form>

        <hr className="divider" />
        <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-secondary)' }}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
