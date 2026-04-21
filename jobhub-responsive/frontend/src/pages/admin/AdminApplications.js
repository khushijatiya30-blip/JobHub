import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { adminAPI } from '../../services/api';

const STATUS_COLOR = {
  APPLIED:'blue', UNDER_REVIEW:'yellow', SHORTLISTED:'purple',
  INTERVIEWED:'orange', SELECTED:'green', REJECTED:'red'
};

export default function AdminApplications() {
  const [apps,    setApps]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('ALL');

  useEffect(() => {
    adminAPI.getApplications()
      .then(res => setApps(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'ALL'
    ? apps
    : apps.filter(a => a.status === filter);

  const statuses = ['ALL','APPLIED','SHORTLISTED','SELECTED','REJECTED'];

  return (
    <Layout title="All Applications" subtitle="Monitor all placement applications">
      {/* Filter Tabs */}
      <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
        {statuses.map(s => (
          <button key={s}
            className={`btn ${filter===s ? 'btn-primary' : 'btn-outline'} btn-sm`}
            onClick={() => setFilter(s)}>
            {s}
            <span style={{
              background: filter===s ? 'rgba(255,255,255,0.3)' : 'var(--primary-light)',
              color: filter===s ? 'white' : 'var(--primary)',
              borderRadius:99, padding:'1px 7px', marginLeft:6, fontSize:11
            }}>
              {s==='ALL' ? apps.length : apps.filter(a=>a.status===s).length}
            </span>
          </button>
        ))}
      </div>

      <div className="card">
        {loading ? (
          <div style={{padding:60,textAlign:'center'}}>
            <div className="spin" style={{fontSize:32}}>⏳</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No Applications</h3>
            <p>No applications match this filter.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Student</th>
                  <th>Job</th>
                  <th>Company</th>
                  <th>Match Score</th>
                  <th>Status</th>
                  <th>Applied On</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((app, i) => (
                  <tr key={app.id}>
                    <td style={{color:'var(--text-muted)',fontSize:12}}>{i+1}</td>
                    <td>
                      <strong>{app.student?.name}</strong>
                      <div style={{fontSize:12,color:'var(--text-muted)'}}>{app.student?.branch}</div>
                    </td>
                    <td>
                      <strong>{app.job?.title}</strong>
                      <div style={{fontSize:12,color:'var(--text-muted)'}}>{app.job?.location}</div>
                    </td>
                    <td>{app.job?.company?.companyName || '—'}</td>
                    <td>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <div className="match-bar" style={{flex:1,minWidth:60}}>
                          <div className="match-fill" style={{width:`${app.matchScore||0}%`}}/>
                        </div>
                        <span style={{fontSize:12,fontWeight:700}}>
                          {app.matchScore?.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-${STATUS_COLOR[app.status]||'gray'}`}>
                        {app.status?.replace('_',' ')}
                      </span>
                    </td>
                    <td style={{fontSize:12,color:'var(--text-muted)'}}>
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
