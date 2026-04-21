import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { companyAPI, getFileUrl } from '../../services/api';

const STATUS_COLOR = {
  APPLIED: 'blue', UNDER_REVIEW: 'yellow', SHORTLISTED: 'purple',
  INTERVIEWED: 'orange', SELECTED: 'green', REJECTED: 'red'
};

function getRankBadge(rank) {
  const medals = { 1: '🥇', 2: '🥈', 3: '🥉' };
  const cls    = rank <= 3 ? `rank-${rank}` : 'rank-other';
  return (
    <span className={`match-rank-badge ${cls}`} title={`Rank #${rank}`}>
      {medals[rank] || `#${rank}`}
    </span>
  );
}

function MatchBar({ score }) {
  const color = score >= 70 ? 'var(--success)' : score >= 40 ? 'var(--warning)' : 'var(--danger)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 100 }}>
      <div className="match-bar" style={{ flex: 1 }}>
        <div className="match-fill" style={{ width: `${score}%`, background: color }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, minWidth: 34, color }}>{score.toFixed(0)}%</span>
    </div>
  );
}

export default function ApplicantsPage() {
  const [jobs,        setJobs]        = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [apps,        setApps]        = useState([]);
  const [toast,       setToast]       = useState({ msg: '', type: 'success' });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: 'success' }), 3500);
  };

  useEffect(() => {
    companyAPI.getJobs().then(res => {
      const j = res.data.data || [];
      setJobs(j);
      const jobId = new URLSearchParams(window.location.search).get('jobId');
      if (jobId) { setSelectedJob(jobId); loadApplicants(jobId); }
    });
  }, []);

  const loadApplicants = jobId => {
    companyAPI.getApplicants(jobId)
      .then(res => {
        // Sort descending by matchScore right when data arrives
        const sorted = (res.data.data || []).sort(
          (a, b) => (b.matchScore || 0) - (a.matchScore || 0)
        );
        setApps(sorted);
      })
      .catch(() => showToast('❌ Could not load applicants', 'error'));
  };

  const updateStatus = async (appId, status) => {
    const feedback = status === 'REJECTED' ? (prompt('Optional feedback:') || '') : '';
    try {
      await companyAPI.updateStatus(appId, status, feedback);
      showToast('✅ Status updated');
      loadApplicants(selectedJob);
    } catch {
      showToast('❌ Update failed', 'error');
    }
  };

  const toastBg = toast.type === 'error'
    ? { bg: '#fee2e2', border: '#fca5a5', color: '#dc2626' }
    : { bg: '#f0fdf4', border: '#86efac', color: '#16a34a' };

  return (
    <Layout title="Applicants" subtitle="Review and manage candidates — sorted by skill match">
      {toast.msg && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          background: toastBg.bg, border: `1px solid ${toastBg.border}`,
          color: toastBg.color, padding: '14px 22px', borderRadius: 12,
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)', fontWeight: 600, fontSize: 14,
        }}>
          {toast.msg}
        </div>
      )}

      <div style={{ marginBottom: 20 }}>
        <select
          className="form-control"
          style={{ maxWidth: 360 }}
          value={selectedJob}
          onChange={e => {
            setSelectedJob(e.target.value);
            if (e.target.value) loadApplicants(e.target.value);
          }}
        >
          <option value="">— Select a Job —</option>
          {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
        </select>
      </div>

      {/* Info banner when applicants exist */}
      {apps.length > 0 && (
        <div className="alert alert-info" style={{ marginBottom: 16, fontSize: 13 }}>
          📊 <strong>{apps.length} applicant{apps.length !== 1 ? 's' : ''}</strong> — sorted by skill match % (highest first) to help you shortlist faster.
        </div>
      )}

      <div className="card">
        {!selectedJob ? (
          <div className="empty-state">
            <div className="empty-icon">💼</div>
            <h3>Select a Job</h3>
            <p>Upar se job select karo applicants dekhne ke liye.</p>
          </div>
        ) : apps.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h3>No Applicants Yet</h3>
            <p>Is job ke liye abhi koi application nahi aayi.</p>
          </div>
        ) : (
          <>
            {/* ── Desktop table view ── */}
            <div className="table-wrap applicants-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: 50 }}>Rank</th>
                    <th>Candidate</th>
                    <th>Branch</th>
                    <th>CGPA</th>
                    <th>Match %</th>
                    <th>Resume</th>
                    <th>Status</th>
                    <th>Applied</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {apps.map((app, index) => {
                    const rank      = index + 1;
                    const resumeUrl = getFileUrl(app.student?.resumePath);
                    const photoUrl  = getFileUrl(app.student?.profilePhoto);
                    const score     = app.matchScore || 0;
                    return (
                      <tr key={app.id} style={{ background: rank === 1 ? '#fffbeb' : rank === 2 ? '#f8fafc' : undefined }}>
                        <td style={{ textAlign: 'center' }}>
                          {getRankBadge(rank)}
                        </td>

                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                              width: 38, height: 38, borderRadius: '50%', overflow: 'hidden',
                              background: '#e5e7eb', flexShrink: 0,
                              display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                              {photoUrl
                                ? <img src={photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={e => { e.target.style.display = 'none'; }} />
                                : <span style={{ fontSize: 18 }}>👤</span>}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700 }}>{app.student?.name || '—'}</div>
                              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                {app.student?.user?.email || '—'}
                              </div>
                              {app.student?.college && (
                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{app.student.college}</div>
                              )}
                            </div>
                          </div>
                        </td>

                        <td style={{ fontSize: 13 }}>{app.student?.branch || '—'}</td>

                        <td>
                          <span style={{
                            fontWeight: 700, fontSize: 13,
                            color: (app.student?.cgpa || 0) >= 8 ? '#16a34a'
                                 : (app.student?.cgpa || 0) >= 6 ? '#d97706' : '#dc2626'
                          }}>
                            {app.student?.cgpa || '—'}
                          </span>
                        </td>

                        <td>
                          <MatchBar score={score} />
                        </td>

                        <td>
                          {resumeUrl ? (
                            <a href={resumeUrl} target="_blank" rel="noreferrer"
                              className="btn btn-outline btn-sm"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
                              📄 Resume
                            </a>
                          ) : (
                            <span style={{ fontSize: 11, color: '#9ca3af' }}>Not uploaded</span>
                          )}
                        </td>

                        <td>
                          <span className={`badge badge-${STATUS_COLOR[app.status] || 'gray'}`}>
                            {app.status?.replace(/_/g, ' ')}
                          </span>
                        </td>

                        <td style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          {new Date(app.appliedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>

                        <td>
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                            <button className="btn btn-sm"
                              style={{ background: '#7c3aed', color: 'white', border: 'none', cursor: 'pointer' }}
                              onClick={() => updateStatus(app.id, 'SHORTLISTED')}>Shortlist</button>
                            <button className="btn btn-primary btn-sm"
                              onClick={() => updateStatus(app.id, 'SELECTED')}>Select</button>
                            <button className="btn btn-danger btn-sm"
                              onClick={() => updateStatus(app.id, 'REJECTED')}>Reject</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ── Mobile card view (hidden on desktop) ── */}
            <div className="applicants-card-list" style={{ display: 'none', padding: '12px' }}>
              {apps.map((app, index) => {
                const rank      = index + 1;
                const resumeUrl = getFileUrl(app.student?.resumePath);
                const photoUrl  = getFileUrl(app.student?.profilePhoto);
                const score     = app.matchScore || 0;
                return (
                  <div key={app.id} className="applicant-card"
                    style={{ borderLeft: rank <= 3 ? '4px solid var(--primary)' : undefined }}>
                    <div className="applicant-card-header">
                      {getRankBadge(rank)}
                      <div style={{
                        width: 40, height: 40, borderRadius: '50%', overflow: 'hidden',
                        background: '#e5e7eb', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        {photoUrl
                          ? <img src={photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={e => { e.target.style.display = 'none'; }} />
                          : <span style={{ fontSize: 20 }}>👤</span>}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 15 }}>{app.student?.name || '—'}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {app.student?.user?.email || '—'}
                        </div>
                      </div>
                      <span className={`badge badge-${STATUS_COLOR[app.status] || 'gray'}`} style={{ flexShrink: 0 }}>
                        {app.status?.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="applicant-card-meta">
                      <span>🎓 {app.student?.branch || '—'}</span>
                      <span>📊 CGPA: <strong
                        style={{ color: (app.student?.cgpa || 0) >= 8 ? '#16a34a' : (app.student?.cgpa || 0) >= 6 ? '#d97706' : '#dc2626' }}>
                        {app.student?.cgpa || '—'}
                      </strong></span>
                      {app.student?.college && <span>🏫 {app.student.college}</span>}
                    </div>

                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Skill Match</div>
                      <MatchBar score={score} />
                    </div>

                    <div className="applicant-card-actions">
                      {resumeUrl && (
                        <a href={resumeUrl} target="_blank" rel="noreferrer"
                          className="btn btn-outline btn-sm">📄 View Resume</a>
                      )}
                      <button className="btn btn-sm"
                        style={{ background: '#7c3aed', color: 'white', border: 'none', cursor: 'pointer' }}
                        onClick={() => updateStatus(app.id, 'SHORTLISTED')}>✓ Shortlist</button>
                      <button className="btn btn-primary btn-sm"
                        onClick={() => updateStatus(app.id, 'SELECTED')}>✅ Select</button>
                      <button className="btn btn-danger btn-sm"
                        onClick={() => updateStatus(app.id, 'REJECTED')}>✗ Reject</button>
                    </div>

                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
                      Applied: {new Date(app.appliedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
