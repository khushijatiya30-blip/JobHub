import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { companyAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';

export default function CompanyJobsPage() {
  const [jobs, setJobs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    companyAPI.getJobs().then(res => setJobs(res.data.data || []));
  }, []);

  return (
    <Layout title="My Jobs" subtitle="Manage your job postings">
      <div style={{marginBottom:20,display:'flex',justifyContent:'flex-end'}}>
        <button className="btn btn-primary" onClick={() => navigate('/company/post-job')}>+ Post New Job</button>
      </div>
      <div className="card">
        {jobs.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">💼</div><h3>No jobs posted yet</h3>
            <button className="btn btn-primary" onClick={() => navigate('/company/post-job')}>Post a Job</button>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Title</th><th>Location</th><th>Type</th><th>Openings</th><th>Deadline</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {jobs.map(j => (
                  <tr key={j.id}>
                    <td><strong>{j.title}</strong></td>
                    <td>{j.location||'—'}</td>
                    <td>{j.jobType||'—'}</td>
                    <td>{j.openings||1}</td>
                    <td style={{fontSize:12}}>{j.deadline ? new Date(j.deadline).toLocaleDateString() : '—'}</td>
                    <td><span className={`badge badge-${j.status==='ACTIVE'?'green':'gray'}`}>{j.status}</span></td>
                    <td><button className="btn btn-outline btn-sm" onClick={() => navigate(`/company/applicants?jobId=${j.id}`)}>View Applicants</button></td>
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
