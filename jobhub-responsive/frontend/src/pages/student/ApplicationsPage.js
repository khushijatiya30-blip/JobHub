import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { studentAPI } from '../../services/api';

const STATUS_COLOR = {
  APPLIED:'blue', UNDER_REVIEW:'yellow', SHORTLISTED:'purple',
  INTERVIEWED:'orange', SELECTED:'green', REJECTED:'red'
};

export default function ApplicationsPage() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentAPI.getApplications()
      .then(res => setApps(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout title="My Applications" subtitle={`${apps.length} applications`}>
      {loading ? (
        <div style={{textAlign:'center',padding:60}}><div className="spin" style={{fontSize:32}}>⏳</div></div>
      ) : apps.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No Applications Yet</h3>
          <p>Browse jobs and start applying!</p>
          <a href="/student/jobs" className="btn btn-primary">Browse Jobs</a>
        </div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Job</th><th>Company</th><th>Match</th><th>Status</th><th>Feedback</th><th>Applied</th></tr>
              </thead>
              <tbody>
                {apps.map(app => (
                  <tr key={app.id}>
                    <td><strong>{app.job?.title}</strong><div style={{fontSize:12,color:'var(--text-muted)'}}>{app.job?.location}</div></td>
                    <td>{app.job?.company?.companyName}</td>
                    <td>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <div className="match-bar" style={{flex:1,minWidth:60}}>
                          <div className="match-fill" style={{width:`${app.matchScore||0}%`}}/>
                        </div>
                        <span style={{fontSize:12,fontWeight:700}}>{app.matchScore?.toFixed(0)}%</span>
                      </div>
                    </td>
                    <td><span className={`badge badge-${STATUS_COLOR[app.status]||'gray'}`}>{app.status?.replace('_',' ')}</span></td>
                    <td style={{fontSize:13,color:'var(--text-secondary)',maxWidth:200}}>{app.companyFeedback||'—'}</td>
                    <td style={{fontSize:12,color:'var(--text-muted)'}}>{new Date(app.appliedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Layout>
  );
}
