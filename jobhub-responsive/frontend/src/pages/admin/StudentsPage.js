import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { adminAPI } from '../../services/api';

const STATUS_COLOR = { NOT_PLACED:'gray', APPLIED:'blue', SHORTLISTED:'purple', PLACED:'green' };

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [selected, setSelected] = useState(null); // student detail modal

  useEffect(() => {
    adminAPI.getStudents()
      .then(res => setStudents(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = students.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.branch?.toLowerCase().includes(search.toLowerCase()) ||
    s.college?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout title="Students" subtitle={`${students.length} registered students`}>

      {/* ── Student Detail Modal ── */}
      {selected && (
        <div style={{position:'fixed',inset:0,zIndex:1000,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',padding:20}}
          onClick={() => setSelected(null)}>
          <div style={{background:'white',borderRadius:16,width:'100%',maxWidth:520,maxHeight:'90vh',display:'flex',flexDirection:'column',boxShadow:'0 24px 60px rgba(0,0,0,0.25)',overflow:'hidden'}}
            onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div style={{display:'flex',alignItems:'center',gap:14,padding:'18px 24px',borderBottom:'1px solid #f0f0f0',background:'#fafafa'}}>
              {/* Profile photo */}
              <div style={{width:52,height:52,borderRadius:'50%',overflow:'hidden',background:'#e5e7eb',display:'flex',alignItems:'center',justifyContent:'center',border:'2px solid var(--primary,#6366f1)',flexShrink:0}}>
                {selected.profilePhoto
                  ? <img src={require('../../services/api').getFileUrl(selected.profilePhoto)} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                  : <span style={{fontSize:26}}>👤</span>}
              </div>
              <div style={{flex:1}}>
                <h2 style={{margin:0,fontSize:18,fontWeight:700}}>{selected.name}</h2>
                <span style={{fontSize:12,color:'#6b7280'}}>{selected.user?.email}</span>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <span className={`badge badge-${STATUS_COLOR[selected.placementStatus]||'gray'}`}>
                  {selected.placementStatus?.replace('_',' ')}
                </span>
                <button onClick={() => setSelected(null)}
                  style={{background:'none',border:'none',cursor:'pointer',fontSize:18,color:'#9ca3af'}}>✕</button>
              </div>
            </div>

            {/* Body */}
            <div style={{padding:'20px 24px',overflowY:'auto',flex:1}}>
              <div className="profile-grid-2" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:16}}>
                {[
                  ['🏫 College',       selected.college      || '—'],
                  ['🌿 Branch',        selected.branch       || '—'],
                  ['📅 Grad Year',     selected.graduationYear || '—'],
                  ['🎓 CGPA',          selected.cgpa         || '—'],
                  ['📞 Phone',         selected.phone        || '—'],
                  ['📍 Address',       selected.address      || '—'],
                ].map(([k,v]) => (
                  <div key={k} style={{background:'#f9fafb',borderRadius:8,padding:'10px 12px'}}>
                    <div style={{fontSize:11,color:'#9ca3af',fontWeight:600,marginBottom:3}}>{k}</div>
                    <div style={{fontWeight:600,fontSize:13}}>{v}</div>
                  </div>
                ))}
              </div>

              {/* LinkedIn / GitHub */}
              <div style={{display:'flex',gap:8,marginBottom:14,flexWrap:'wrap'}}>
                {selected.linkedinUrl && (
                  <a href={selected.linkedinUrl} target="_blank" rel="noreferrer"
                    className="btn btn-outline btn-sm">🔗 LinkedIn</a>
                )}
                {selected.githubUrl && (
                  <a href={selected.githubUrl} target="_blank" rel="noreferrer"
                    className="btn btn-outline btn-sm">🐙 GitHub</a>
                )}
              </div>

              {/* Skills */}
              {selected.skills?.length > 0 && (
                <div style={{marginBottom:14}}>
                  <div style={{fontSize:12,fontWeight:600,color:'#6b7280',marginBottom:8}}>🛠️ SKILLS</div>
                  <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                    {selected.skills.map(sk => (
                      <span key={sk.id} className="skill-chip">{sk.name}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Resume button */}
              <div style={{display:'flex',gap:8}}>
                {selected.resumePath
                  ? <a href={require('../../services/api').getFileUrl(selected.resumePath)} target="_blank" rel="noreferrer"
                      className="btn btn-primary btn-sm">📄 View Resume</a>
                  : <span style={{fontSize:13,color:'#9ca3af'}}>📎 No resume uploaded</span>}
              </div>
            </div>

            {/* Footer */}
            <div style={{padding:'12px 24px',borderTop:'1px solid #f0f0f0',background:'#fafafa',display:'flex',justifyContent:'flex-end'}}>
              <button className="btn btn-outline btn-sm" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginBottom:20 }}>
        <input className="form-control" placeholder="🔍  Search by name, branch or college…"
          value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth:380 }} />
      </div>

      <div className="card">
        {loading ? (
          <div style={{ padding:60, textAlign:'center' }}>
            <div className="spin" style={{ fontSize:32 }}>⏳</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👨‍🎓</div>
            <h3>No Students Found</h3>
            <p>No students match your search.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Photo</th>
                  <th>Name</th>
                  <th>Branch</th>
                  <th>College</th>
                  <th>CGPA</th>
                  <th>Skills</th>
                  <th>Grad Year</th>
                  <th>Status</th>
                  <th>Resume</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <tr key={s.id} style={{cursor:'pointer'}} onClick={() => setSelected(s)}>
                    <td style={{ color:'var(--text-muted)', fontSize:12 }}>{i + 1}</td>
                    <td onClick={e => e.stopPropagation()}>
                      <div style={{width:34,height:34,borderRadius:'50%',overflow:'hidden',background:'#e5e7eb',display:'flex',alignItems:'center',justifyContent:'center',border:'1px solid #d1d5db'}}>
                        {s.profilePhoto
                          ? <img src={require('../../services/api').getFileUrl(s.profilePhoto)} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                          : <span style={{fontSize:16}}>👤</span>}
                      </div>
                    </td>
                    <td>
                      <strong>{s.name}</strong>
                      <div style={{ fontSize:12, color:'var(--text-muted)' }}>{s.user?.email}</div>
                    </td>
                    <td>{s.branch || '—'}</td>
                    <td style={{ maxWidth:160, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {s.college || '—'}
                    </td>
                    <td>
                      <span style={{
                        fontWeight:700,
                        color: s.cgpa >= 8 ? 'var(--success)' : s.cgpa >= 6 ? 'var(--primary)' : 'var(--warning)',
                      }}>
                        {s.cgpa || '—'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                        {s.skills?.slice(0,3).map(sk => (
                          <span key={sk.id} className="skill-chip" style={{ fontSize:10, padding:'2px 8px' }}>
                            {sk.name}
                          </span>
                        ))}
                        {s.skills?.length > 3 && (
                          <span style={{ fontSize:11, color:'var(--text-muted)' }}>+{s.skills.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td>{s.graduationYear || '—'}</td>
                    <td>
                      <span className={`badge badge-${STATUS_COLOR[s.placementStatus] || 'gray'}`}>
                        {s.placementStatus?.replace('_', ' ')}
                      </span>
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      {s.resumePath
                        ? <a href={require('../../services/api').getFileUrl(s.resumePath)} target="_blank" rel="noreferrer"
                            className="badge badge-green" style={{cursor:'pointer',textDecoration:'none'}}>
                            📄 Download
                          </a>
                        : <span className="badge badge-gray">No</span>}
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <button className="btn btn-outline btn-sm" onClick={() => setSelected(s)}>
                        👁 View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <p style={{fontSize:12,color:'var(--text-muted)',marginTop:8}}>
        💡 Kisi bhi row ya <strong>👁 View</strong> pe click karein — student ki puri detail dekhein
      </p>
    </Layout>
  );
}
