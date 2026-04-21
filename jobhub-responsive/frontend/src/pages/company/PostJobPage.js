// pages/company/PostJobPage.js
import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { companyAPI, jobAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';

export default function PostJobPage() {
  const navigate = useNavigate();
  const [allSkills, setAllSkills] = useState([]);
  const [form, setForm] = useState({
    title: '', description: '', location: '', jobType: 'FULLTIME',
    workMode: 'ONSITE', salaryMin: '', salaryMax: '',
    minCgpa: '', minExperience: '', deadline: '', openings: 1,
    requiredSkillIds: [],
  });
  const [loading, setLoading] = useState(false);
  const [toast,   setToast]   = useState('');

  useEffect(() => {
    jobAPI.getSkills().then(res => setAllSkills(res.data.data || []));
  }, []);

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleChange = e =>
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const toggleSkill = id => {
    setForm(p => ({
      ...p,
      requiredSkillIds: p.requiredSkillIds.includes(id)
        ? p.requiredSkillIds.filter(s => s !== id)
        : [...p.requiredSkillIds, id],
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await companyAPI.postJob({
        ...form,
        salaryMin:     parseFloat(form.salaryMin)     || null,
        salaryMax:     parseFloat(form.salaryMax)     || null,
        minCgpa:       parseFloat(form.minCgpa)       || null,
        minExperience: parseInt(form.minExperience)   || 0,
        openings:      parseInt(form.openings)        || 1,
      });
      showToast('✅ Job posted successfully!');
      setTimeout(() => navigate('/company/jobs'), 1500);
    } catch (err) {
      showToast('❌ ' + (err.response?.data?.message || 'Failed to post job'));
    } finally {
      setLoading(false);
    }
  };

  // Group skills by category
  const grouped = allSkills.reduce((acc, s) => {
    const cat = s.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s);
    return acc;
  }, {});

  return (
    <Layout title="Post a Job" subtitle="Attract the best talent">
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          background: 'white', padding: '14px 20px', borderRadius: 10,
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)', fontWeight: 600,
        }}>{toast}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="student-mid-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
          {/* Left */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Basic Info */}
            <div className="card">
              <div className="card-header"><span className="card-title">📝 Job Details</span></div>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">Job Title *</label>
                  <input name="title" className="form-control" required
                    placeholder="e.g. Senior Java Developer"
                    value={form.title} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Job Description</label>
                  <textarea name="description" className="form-control" rows={5}
                    placeholder="Describe the role, responsibilities, and requirements…"
                    value={form.description} onChange={handleChange} />
                </div>
                <div className="profile-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {[
                    { name: 'location', label: 'Location', type: 'text', placeholder: 'e.g. Bangalore' },
                    { name: 'deadline', label: 'Application Deadline', type: 'date' },
                    { name: 'salaryMin', label: 'Salary Min (₹)', type: 'number', placeholder: '500000' },
                    { name: 'salaryMax', label: 'Salary Max (₹)', type: 'number', placeholder: '1000000' },
                    { name: 'minCgpa',  label: 'Min CGPA',        type: 'number', placeholder: '6.5', step: '0.1' },
                    { name: 'openings', label: 'Openings',         type: 'number', placeholder: '5' },
                  ].map(f => (
                    <div key={f.name} className="form-group">
                      <label className="form-label">{f.label}</label>
                      <input name={f.name} type={f.type} className="form-control"
                        placeholder={f.placeholder} step={f.step}
                        value={form[f.name]} onChange={handleChange} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Required Skills */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">🎯 Required Skills</span>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  {form.requiredSkillIds.length} selected
                </span>
              </div>
              <div className="card-body">
                {Object.entries(grouped).map(([cat, skills]) => (
                  <div key={cat} style={{ marginBottom: 14 }}>
                    <div style={{
                      fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                      letterSpacing: 1, color: 'var(--text-muted)', marginBottom: 8,
                    }}>{cat}</div>
                    <div className="job-skills">
                      {skills.map(s => (
                        <div key={s.id}
                          onClick={() => toggleSkill(s.id)}
                          className="skill-chip"
                          style={{
                            cursor: 'pointer',
                            background: form.requiredSkillIds.includes(s.id)
                              ? 'var(--primary)' : 'var(--primary-light)',
                            color: form.requiredSkillIds.includes(s.id)
                              ? 'white' : 'var(--primary)',
                          }}>
                          {form.requiredSkillIds.includes(s.id) ? '✓ ' : '+ '}{s.name}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="card">
              <div className="card-header"><span className="card-title">⚙️ Job Settings</span></div>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">Job Type</label>
                  <select name="jobType" className="form-control"
                    value={form.jobType} onChange={handleChange}>
                    {['FULLTIME','PARTTIME','INTERNSHIP','CONTRACT'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Work Mode</label>
                  <select name="workMode" className="form-control"
                    value={form.workMode} onChange={handleChange}>
                    {['ONSITE','REMOTE','HYBRID'].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Min Experience (months)</label>
                  <input name="minExperience" type="number" className="form-control"
                    placeholder="0 for fresher" value={form.minExperience} onChange={handleChange} />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <div className="alert alert-info" style={{ marginBottom: 16 }}>
                  The smart matching algorithm will automatically rank applicants based on
                  skills, CGPA, and experience.
                </div>
                <button type="submit" className="btn btn-primary btn-lg"
                  style={{ width: '100%' }} disabled={loading}>
                  {loading ? <span className="spin">⏳</span> : '📢'} &nbsp;
                  {loading ? 'Posting…' : 'Post Job'}
                </button>
                <button type="button" className="btn btn-outline"
                  style={{ width: '100%', marginTop: 10 }}
                  onClick={() => navigate('/company/dashboard')}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </Layout>
  );
}
