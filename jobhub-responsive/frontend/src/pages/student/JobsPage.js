// pages/student/JobsPage.js
import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { jobAPI } from '../../services/api';

export default function JobsPage() {
  const [jobs,         setJobs]         = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [applying,     setApplying]     = useState(null);
  const [coverLetter,  setCoverLetter]  = useState('');
  const [toast,        setToast]        = useState('');
  const [companyModal, setCompanyModal] = useState(null); // company detail popup

  useEffect(() => {
    jobAPI.getJobs()
      .then(res => setJobs(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleApply = async (jobId) => {
    try {
      await jobAPI.applyForJob({ jobId, coverLetter });
      showToast('✅ Application submitted successfully!');
      setApplying(null);
      setCoverLetter('');
    } catch (err) {
      showToast('❌ ' + (err.response?.data?.message || 'Failed to apply'));
    }
  };

  const normalize = item => item.job
    ? { ...item.job, matchScore: item.matchScore, meetsMinimum: item.meetsMinimum }
    : item;

  const filtered = jobs
    .map(normalize)
    .filter(j =>
      j.title?.toLowerCase().includes(search.toLowerCase()) ||
      j.company?.companyName?.toLowerCase().includes(search.toLowerCase()) ||
      j.location?.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <Layout title="Browse Jobs" subtitle={`${filtered.length} jobs available`}>
      {/* Toast */}
      {toast && (
        <div style={{
          position:'fixed',top:20,right:20,zIndex:9999,
          background:'white',padding:'14px 20px',borderRadius:10,
          boxShadow:'0 8px 24px rgba(0,0,0,0.15)',fontSize:14,fontWeight:600,
        }}>{toast}</div>
      )}

      {/* Search */}
      <div style={{ marginBottom:24, display:'flex', gap:12 }}>
        <input
          className="form-control"
          placeholder="🔍  Search by title, company or location…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth:400 }}
        />
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding:60 }}>
          <div className="spin" style={{ fontSize:36 }}>⏳</div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💼</div>
          <h3>No Jobs Found</h3>
          <p>Try a different search term or check back later.</p>
        </div>
      ) : (
        <div className="job-grid">
          {filtered.map(job => (
            <div key={job.id} className="job-card">
              {/* Company + title */}
              <div className="job-company">
                {/* Company logo — clickable to see details */}
                <button
                  onClick={() => setCompanyModal(job.company)}
                  style={{background:'none',border:'none',padding:0,cursor:'pointer',display:'flex',alignItems:'center',gap:10,textAlign:'left'}}
                  title="Company ki detail dekhein"
                >
                  <div style={{
                    width:40,height:40,borderRadius:8,overflow:'hidden',background:'#f3f4f6',
                    display:'flex',alignItems:'center',justifyContent:'center',
                    border:'1px solid #e5e7eb',flexShrink:0
                  }}>
                    {job.company?.logoPath
                      ? <img src={require('../../services/api').getFileUrl(job.company.logoPath)} alt="logo" style={{width:'100%',height:'100%',objectFit:'contain'}}/>
                      : <span style={{fontWeight:700,fontSize:16,color:'var(--primary,#6366f1)'}}>
                          {job.company?.companyName?.[0] || 'C'}
                        </span>}
                  </div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:13, color:'var(--primary,#6366f1)' }}>
                      {job.company?.companyName}
                    </div>
                    <div style={{ fontSize:11, color:'var(--text-muted)' }}>
                      {job.company?.industry} {job.company?.city ? `• ${job.company.city}` : ''}
                    </div>
                  </div>
                </button>
              </div>

              <div className="job-title">{job.title}</div>

              {/* Meta */}
              <div className="job-meta">
                {job.location     && <span className="job-tag">📍 {job.location}</span>}
                {job.jobType      && <span className="job-tag">💼 {job.jobType}</span>}
                {job.workMode     && <span className="job-tag">🖥️ {job.workMode}</span>}
                {job.salaryMin    && (
                  <span className="job-tag">
                    💰 ₹{(job.salaryMin/100000).toFixed(1)}L – {(job.salaryMax/100000).toFixed(1)}L
                  </span>
                )}
                {job.minCgpa      && <span className="job-tag">🎓 Min CGPA: {job.minCgpa}</span>}
              </div>

              {/* Skills */}
              {job.requiredSkills?.length > 0 && (
                <div className="job-skills">
                  {job.requiredSkills.slice(0,5).map(s => (
                    <span key={s.id} className="skill-chip">{s.name}</span>
                  ))}
                  {job.requiredSkills.length > 5 && (
                    <span className="skill-chip">+{job.requiredSkills.length - 5} more</span>
                  )}
                </div>
              )}

              {/* Match Score */}
              {job.matchScore !== undefined && (
                <div style={{ marginBottom:14 }}>
                  <div className="match-label">
                    <span>Match Score</span>
                    <span style={{ fontWeight:700, color: job.matchScore >= 60 ? 'var(--success)' : 'var(--warning)' }}>
                      {job.matchScore?.toFixed(0)}%
                    </span>
                  </div>
                  <div className="match-bar">
                    <div className="match-fill" style={{ width:`${job.matchScore}%` }} />
                  </div>
                </div>
              )}

              {/* Deadline */}
              {job.deadline && (
                <div style={{ fontSize:12, color:'var(--text-muted)', marginBottom:14 }}>
                  ⏰ Deadline: {new Date(job.deadline).toLocaleDateString()}
                </div>
              )}

              {!job.meetsMinimum && job.meetsMinimum !== undefined && (
                <div className="alert alert-error" style={{ fontSize:12, padding:'6px 10px' }}>
                  ⚠️ You don't meet the minimum CGPA requirement
                </div>
              )}

              <div style={{display:'flex',gap:8}}>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => setCompanyModal(job.company)}
                  title="Company info"
                >🏢</button>
                <button
                  className="btn btn-primary"
                  style={{ flex:1 }}
                  onClick={() => setApplying(job)}
                >
                  Apply Now →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Company Detail Modal ── */}
      {companyModal && (
        <div style={{position:'fixed',inset:0,zIndex:1000,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',padding:20}}
          onClick={() => setCompanyModal(null)}>
          <div style={{background:'white',borderRadius:16,width:'100%',maxWidth:520,maxHeight:'90vh',display:'flex',flexDirection:'column',boxShadow:'0 24px 60px rgba(0,0,0,0.25)',overflow:'hidden'}}
            onClick={e => e.stopPropagation()}>

            {/* Modal Header */}
            <div style={{display:'flex',alignItems:'center',gap:14,padding:'18px 24px',borderBottom:'1px solid #f0f0f0',background:'#fafafa'}}>
              <div style={{width:52,height:52,borderRadius:10,overflow:'hidden',background:'#f3f4f6',display:'flex',alignItems:'center',justifyContent:'center',border:'1px solid #e5e7eb',flexShrink:0}}>
                {companyModal?.logoPath
                  ? <img src={require('../../services/api').getFileUrl(companyModal.logoPath)} alt="logo" style={{width:'100%',height:'100%',objectFit:'contain'}}/>
                  : <span style={{fontSize:26,fontWeight:700,color:'var(--primary,#6366f1)'}}>
                      {companyModal?.companyName?.[0] || '?'}
                    </span>}
              </div>
              <div style={{flex:1}}>
                <h2 style={{margin:0,fontSize:18,fontWeight:700}}>{companyModal?.companyName}</h2>
                <span style={{fontSize:12,color:'#6b7280'}}>{companyModal?.industry || '—'}</span>
              </div>
              <button onClick={() => setCompanyModal(null)}
                style={{background:'none',border:'none',cursor:'pointer',fontSize:18,color:'#9ca3af'}}>✕</button>
            </div>

            {/* Modal Body */}
            <div style={{padding:'20px 24px',overflowY:'auto',flex:1}}>
              <div style={{display:'grid',gap:10,fontSize:14}}>
                {[
                  ['📧 Email',           companyModal?.user?.email   || companyModal?.email || '—'],
                  ['📞 Contact',         companyModal?.phone          || '—'],
                  ['📍 Main Location',   [companyModal?.city, companyModal?.state].filter(Boolean).join(', ') || '—'],
                  ['🏠 Current Address', companyModal?.currentAddress || '—'],
                  ['🌐 Website',         companyModal?.website        || '—'],
                  ['🏭 Industry',        companyModal?.industry       || '—'],
                ].map(([k,v]) => (
                  <div key={k} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid #f3f4f6'}}>
                    <span style={{color:'#6b7280',fontWeight:500,flexShrink:0}}>{k}</span>
                    <span style={{fontWeight:600,textAlign:'right',maxWidth:'60%',wordBreak:'break-word'}}>
                      {k === '🌐 Website' && v !== '—'
                        ? <a href={v} target="_blank" rel="noreferrer" style={{color:'var(--primary,#6366f1)'}}>{v}</a>
                        : v}
                    </span>
                  </div>
                ))}
              </div>
              {companyModal?.description && (
                <div style={{marginTop:14,padding:'12px 14px',background:'#f9fafb',borderRadius:8}}>
                  <div style={{fontSize:11,color:'#9ca3af',fontWeight:600,marginBottom:6,textTransform:'uppercase'}}>📝 About Company</div>
                  <p style={{margin:0,fontSize:13,lineHeight:1.7,color:'#374151'}}>{companyModal.description}</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{padding:'14px 24px',borderTop:'1px solid #f0f0f0',background:'#fafafa',display:'flex',justifyContent:'flex-end'}}>
              <button className="btn btn-outline btn-sm" onClick={() => setCompanyModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Apply Modal ── */}
      {applying && (
        <div className="modal-overlay" onClick={() => setApplying(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="card-title">Apply for {applying.title}</h3>
              <button className="modal-close" onClick={() => setApplying(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="alert alert-info" style={{ marginBottom:16 }}>
                <div><strong>{applying.company?.companyName}</strong></div>
                <div style={{ fontSize:12 }}>{applying.location} • {applying.jobType}</div>
              </div>
              <div className="form-group">
                <label className="form-label">Cover Letter (optional)</label>
                <textarea
                  className="form-control"
                  placeholder="Tell the company why you're a great fit…"
                  value={coverLetter}
                  onChange={e => setCoverLetter(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setApplying(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => handleApply(applying.id)}>
                Submit Application
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
