// pages/student/StudentDashboard.js
import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { studentAPI, jobAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [profile, setProfile] = useState(null);
  const [apps,    setApps]    = useState([]);
  const [jobs,    setJobs]    = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      studentAPI.getProfile(),
      studentAPI.getApplications(),
      jobAPI.getJobs(),
    ]).then(([p, a, j]) => {
      setProfile(p.data.data);
      setApps(a.data.data || []);
      setJobs(j.data.data || []);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { icon: '💼', label: 'Jobs Available',     value: Array.isArray(jobs) ? jobs.length : 0, color: 'blue' },
    { icon: '📋', label: 'Applications',        value: apps.length,                            color: 'purple' },
    { icon: '🎯', label: 'Skills',              value: profile?.skills?.length || 0,           color: 'green' },
    { icon: '📊', label: 'CGPA',                value: profile?.cgpa || '-',                   color: 'orange' },
  ];

  const statusColor = {
    APPLIED:      'blue',
    UNDER_REVIEW: 'yellow',
    SHORTLISTED:  'purple',
    INTERVIEWED:  'orange',
    SELECTED:     'green',
    REJECTED:     'red',
  };

  const placementProgress = {
    NOT_PLACED:  0, APPLIED: 33, SHORTLISTED: 66, PLACED: 100,
  }[profile?.placementStatus] || 0;

  if (loading) return (
    <Layout title="Dashboard" subtitle={`Welcome back, ${user?.name}`}>
      <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
        <div className="spin" style={{ fontSize: 32 }}>⏳</div>
        <p style={{ marginTop: 12 }}>Loading your dashboard…</p>
      </div>
    </Layout>
  );

  return (
    <Layout title="Student Dashboard" subtitle={`Welcome back, ${user?.name} 👋`}>
      {/* Stats */}
      <div className="stat-grid">
        {stats.map(s => (
          <div key={s.label} className="stat-card">
            <div className={`stat-icon ${s.color}`}>{s.icon}</div>
            <div className="stat-info">
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="student-mid-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 20, marginBottom: 24 }}>
        {/* Profile Completion */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">👤 Profile Status</span>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/student/profile')}>
              Edit
            </button>
          </div>
          <div className="card-body">
            <div style={{ marginBottom: 16 }}>
              <div className="match-label" style={{ marginBottom: 6 }}>
                <span>Placement Progress</span>
                <span>{profile?.placementStatus?.replace('_', ' ')}</span>
              </div>
              <div className="progress">
                <div className="progress-bar" style={{ width: `${placementProgress}%` }} />
              </div>
            </div>
            <div style={{ display: 'grid', gap: 8, fontSize: 14 }}>
              {[
                ['Branch',    profile?.branch     || '-'],
                ['College',   profile?.college    || '-'],
                ['CGPA',      profile?.cgpa       || '-'],
                ['Grad Year', profile?.graduationYear || '-'],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                  <strong>{v}</strong>
                </div>
              ))}
            </div>
            {!profile?.resumePath && (
              <div className="alert alert-info" style={{ marginTop: 12 }}>
                📎 Upload your resume to improve visibility!
              </div>
            )}
          </div>
        </div>

        {/* Skills */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">🎯 My Skills</span>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/student/skills')}>
              Manage
            </button>
          </div>
          <div className="card-body">
            {profile?.skills?.length ? (
              <div className="job-skills">
                {profile.skills.map(s => (
                  <span key={s.id} className="skill-chip">{s.name}</span>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '20px 0' }}>
                <div style={{ fontSize: 36 }}>🎯</div>
                <p>No skills added yet. Add skills to get better job matches!</p>
                <button className="btn btn-primary btn-sm" onClick={() => navigate('/student/skills')}>
                  Add Skills
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Applications */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">📋 Recent Applications</span>
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/student/applications')}>
            View All
          </button>
        </div>
        {apps.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No Applications Yet</h3>
            <p>Browse jobs and apply to get started on your placement journey.</p>
            <button className="btn btn-primary" onClick={() => navigate('/student/jobs')}>
              Browse Jobs
            </button>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Company</th>
                  <th>Match Score</th>
                  <th>Status</th>
                  <th>Applied</th>
                </tr>
              </thead>
              <tbody>
                {apps.slice(0, 5).map(app => (
                  <tr key={app.id}>
                    <td><strong>{app.job?.title}</strong></td>
                    <td>{app.job?.company?.companyName}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="match-bar" style={{ flex: 1 }}>
                          <div className="match-fill" style={{ width: `${app.matchScore || 0}%` }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700 }}>
                          {app.matchScore?.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-${statusColor[app.status] || 'gray'}`}>
                        {app.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                      {new Date(app.appliedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
