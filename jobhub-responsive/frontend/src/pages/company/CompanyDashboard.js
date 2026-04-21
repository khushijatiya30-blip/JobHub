// pages/company/CompanyDashboard.js
import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { companyAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';

export default function CompanyDashboard() {
  const [profile, setProfile] = useState(null);
  const [jobs,    setJobs]    = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([companyAPI.getProfile(), companyAPI.getJobs()])
      .then(([p, j]) => {
        setProfile(p.data.data);
        setJobs(j.data.data || []);
      })
      .catch(console.error);
  }, []);

  const stats = [
    { icon: '💼', label: 'Total Jobs Posted',  value: jobs.length,                                                 color: 'blue' },
    { icon: '✅', label: 'Active Jobs',          value: jobs.filter(j => j.status === 'ACTIVE').length,            color: 'green' },
    { icon: '🏷️', label: 'Approval Status',    value: profile?.approvalStatus || '—',                             color: 'purple' },
    { icon: '📋', label: 'Certificate',          value: profile?.certificatePath ? 'Uploaded' : 'Pending',         color: 'orange' },
  ];

  const isApproved = profile?.approvalStatus === 'APPROVED';

  return (
    <Layout title="Company Dashboard" subtitle={profile?.companyName}>
      {/* Approval Banner */}
      {!isApproved && profile && (
        <div className={`alert ${profile.approvalStatus === 'REJECTED' ? 'alert-error' : 'alert-info'}`}
          style={{ marginBottom: 24 }}>
          {profile.approvalStatus === 'PENDING' ? (
            <>⏳ <strong>Pending Approval</strong> — Admin is reviewing your registration.
              Upload your company certificate to speed up approval.</>
          ) : (
            <>🚫 <strong>Registration Rejected</strong>: {profile.rejectionReason}</>
          )}
        </div>
      )}

      <div className="stat-grid">
        {stats.map(s => (
          <div key={s.label} className="stat-card">
            <div className={`stat-icon ${s.color}`}>{s.icon}</div>
            <div className="stat-info">
              <div className="stat-label">{s.label}</div>
              <div className="stat-value" style={{ fontSize: typeof s.value === 'string' ? 18 : 28 }}>
                {s.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Certificate Upload */}
      {!profile?.certificatePath && (
        <div className="card" style={{ marginBottom: 24, borderColor: 'var(--warning)' }}>
          <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ fontSize: 40 }}>📄</div>
            <div style={{ flex: 1 }}>
              <strong>Upload Company Registration Certificate</strong>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: '4px 0' }}>
                PDF certificate required for admin approval to post jobs.
              </p>
            </div>
            <button className="btn btn-warning" onClick={() => navigate('/company/profile')}>
              Upload Now
            </button>
          </div>
        </div>
      )}

      {/* My Jobs */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">💼 My Job Postings</span>
          {isApproved && (
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/company/post-job')}>
              + Post New Job
            </button>
          )}
        </div>
        {jobs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💼</div>
            <h3>No Jobs Posted Yet</h3>
            <p>{isApproved
              ? 'Start attracting talent by posting your first job.'
              : 'Get admin approval first to post jobs.'}</p>
            {isApproved && (
              <button className="btn btn-primary" onClick={() => navigate('/company/post-job')}>
                Post a Job
              </button>
            )}
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Location</th>
                  <th>Type</th>
                  <th>Salary</th>
                  <th>Status</th>
                  <th>Posted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map(job => (
                  <tr key={job.id}>
                    <td><strong>{job.title}</strong></td>
                    <td>{job.location || '—'}</td>
                    <td>{job.jobType || '—'}</td>
                    <td>{job.salaryMin
                      ? `₹${(job.salaryMin/100000).toFixed(1)}L – ${(job.salaryMax/100000).toFixed(1)}L`
                      : '—'}</td>
                    <td>
                      <span className={`badge badge-${job.status === 'ACTIVE' ? 'green' : 'gray'}`}>
                        {job.status}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {new Date(job.postedAt).toLocaleDateString()}
                    </td>
                    <td>
                      <button className="btn btn-outline btn-sm"
                        onClick={() => navigate(`/company/applicants?jobId=${job.id}`)}>
                        View Applicants
                      </button>
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
