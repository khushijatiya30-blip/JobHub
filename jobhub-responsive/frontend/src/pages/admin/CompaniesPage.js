// pages/admin/CompaniesPage.js
import React, { useEffect, useState, useRef } from 'react';
import Layout from '../../components/Layout';
import { adminAPI } from '../../services/api';
import api from '../../services/api'; // axios instance — proxy use karega, JWT header bhi

// Status colours
const STATUS_COLOR = { PENDING: 'yellow', APPROVED: 'green', REJECTED: 'red' };
const fmt     = v  => v || '—';
const fmtDate = iso => iso
  ? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  : '—';

// PDF Viewer — Axios blob fetch → createObjectURL → object tag
// React proxy (package.json → localhost:8080) forward karega, CORS nahi hoga
function PdfViewer({ certPath }) {
  const [blobUrl, setBlobUrl] = useState(null);
  const [pdfErr,  setPdfErr]  = useState(null);
  const [pdfLoad, setPdfLoad] = useState(true);
  const prevUrl = useRef(null);

  useEffect(() => {
    if (!certPath) return;
    setPdfLoad(true); setPdfErr(null); setBlobUrl(null);
    api.get('/' + certPath, { responseType: 'blob' })
      .then(res => {
        const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
        if (prevUrl.current) URL.revokeObjectURL(prevUrl.current);
        prevUrl.current = url;
        setBlobUrl(url);
      })
      .catch(() => setPdfErr(true))
      .finally(() => setPdfLoad(false));
    return () => { if (prevUrl.current) URL.revokeObjectURL(prevUrl.current); };
  }, [certPath]);

  if (pdfLoad) return (
    <div style={{ textAlign: 'center', padding: '50px 20px', color: '#9ca3af' }}>
      <div style={{ fontSize: 36, marginBottom: 10 }}>⏳</div>
      <p style={{ margin: 0, fontSize: 13 }}>Certificate load ho rahi hai…</p>
    </div>
  );

  if (pdfErr) return (
    <div style={{ textAlign: 'center', padding: '36px 20px', background: '#fef2f2', borderRadius: 10, border: '1px solid #fecaca' }}>
      <div style={{ fontSize: 36, marginBottom: 10 }}>⚠️</div>
      <p style={{ margin: '0 0 8px', fontSize: 13, color: '#b91c1c', fontWeight: 600 }}>Certificate load nahi ho saki</p>
      <p style={{ margin: '0 0 14px', fontSize: 12, color: '#6b7280' }}>
        Backend mein <code>WebMvcConfig.java</code> add karein taaki <code>/uploads/</code> folder serve ho sake
      </p>
      <a href={require('../../services/api').getFileUrl(certPath)} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
        ↗ Direct Link Try Karein
      </a>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
        <a href={blobUrl} download="certificate.pdf" className="btn btn-outline btn-sm">⬇ Download PDF</a>
      </div>
      <object data={blobUrl} type="application/pdf"
        style={{ width: '100%', height: 460, border: '1px solid #e5e7eb', borderRadius: 10, display: 'block' }}>
        <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>
          <p style={{ marginBottom: 12 }}>Browser PDF viewer support nahi karta.</p>
          <a href={blobUrl} download="certificate.pdf" className="btn btn-primary btn-sm">⬇ Download Certificate</a>
        </div>
      </object>
    </div>
  );
}

export default function CompaniesPage() {
  const [companies,  setCompanies]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [toast,      setToast]      = useState('');
  const [filter,     setFilter]     = useState('ALL');
  const [selected,   setSelected]   = useState(null);
  const [activeTab,  setActiveTab]  = useState('details');
  const [rejReason,  setRejReason]  = useState('');
  const [showRejBox, setShowRejBox] = useState(false);

  const load = () => {
    setLoading(true);
    adminAPI.getCompanies()
      .then(res => setCompanies(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const approve = async id => {
    try { await adminAPI.approveCompany(id); showToast('✅ Company approved!'); setSelected(null); load(); }
    catch (err) { showToast('❌ ' + (err.response?.data?.message || 'Error')); }
  };

  const reject = async (id, reason) => {
    if (!reason?.trim()) return;
    try { await adminAPI.rejectCompany(id, reason); showToast('🚫 Company rejected'); setSelected(null); setShowRejBox(false); setRejReason(''); load(); }
    catch (err) { showToast('❌ ' + (err.response?.data?.message || 'Error')); }
  };

  const openModal = (company, tab = 'details') => {
    setSelected(company); setActiveTab(tab); setShowRejBox(false); setRejReason('');
  };
  const closeModal = () => { setSelected(null); setShowRejBox(false); setRejReason(''); };

  const filtered = filter === 'ALL' ? companies : companies.filter(c => c.approvalStatus === filter);

  return (
    <Layout title="Companies" subtitle="Company details dekh kar approval karein">

      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, background: 'white', padding: '14px 20px', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.15)', fontWeight: 600 }}>
          {toast}
        </div>
      )}

      {/* Modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={closeModal}>
          <div style={{ background: 'white', borderRadius: 16, width: '100%', maxWidth: 740, maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 60px rgba(0,0,0,0.25)', overflow: 'hidden' }}
            onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid #f0f0f0', background: '#fafafa' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                {/* Logo or initial */}
                <div style={{ width: 46, height: 46, borderRadius: 10, background: 'var(--primary, #6366f1)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, overflow:'hidden', flexShrink:0 }}>
                  {selected.logoPath
                    ? <img src={require('../../services/api').getFileUrl(selected.logoPath)} alt="logo" style={{width:'100%',height:'100%',objectFit:'contain'}}/>
                    : selected.companyName?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{selected.companyName}</h2>
                  <span style={{ fontSize: 12, color: '#6b7280' }}>{selected.user?.email}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className={`badge badge-${STATUS_COLOR[selected.approvalStatus]}`}>{selected.approvalStatus}</span>
                <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#9ca3af', padding: '4px 8px' }}>✕</button>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', background: '#fafafa' }}>
              {[{ key: 'details', label: '📋 Company Details' }, { key: 'certificate', label: '📄 Certificate' + (!selected.certificatePath ? ' ⚠️' : '') }].map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  style={{ padding: '12px 20px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: activeTab === tab.key ? 'var(--primary, #6366f1)' : '#6b7280', borderBottom: activeTab === tab.key ? '2px solid var(--primary, #6366f1)' : '2px solid transparent' }}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
              {activeTab === 'details' && (
                <div>
                  <div className="profile-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                    {[
                      { icon: '🏢', label: 'Company Name',     val: fmt(selected.companyName) },
                      { icon: '🧾', label: 'GST Number',       val: fmt(selected.gstNumber), mono: true },
                      { icon: '🏛️', label: 'CIN Number',       val: fmt(selected.cinNumber), mono: true },
                      { icon: '📧', label: 'Email',            val: fmt(selected.user?.email) },
                      { icon: '📞', label: 'Contact',          val: fmt(selected.phone) },
                      { icon: '🏭', label: 'Industry',         val: fmt(selected.industry) },
                      { icon: '📍', label: 'Main Location',    val: [selected.city, selected.state].filter(Boolean).join(', ') || '—' },
                      { icon: '📅', label: 'Registered On',    val: fmtDate(selected.createdAt) },
                      { icon: '🌐', label: 'Website',          val: selected.website ? <a href={selected.website} target="_blank" rel="noreferrer" style={{ color: 'var(--primary,#6366f1)', wordBreak: 'break-all' }}>{selected.website}</a> : '—' },
                    ].map(({ icon, label, val, mono }) => (
                      <div key={label} style={{ background: '#f9fafb', borderRadius: 10, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em' }}>{icon} {label}</span>
                        <span style={{ fontWeight: 600, fontSize: 14, fontFamily: mono ? 'monospace' : 'inherit' }}>{val}</span>
                      </div>
                    ))}
                  </div>
                  {selected.currentAddress && (
                    <div style={{ marginBottom: 12, padding: '12px 14px', background: '#f9fafb', borderRadius: 10 }}>
                      <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>🏠 Current Address</span>
                      <p style={{ margin: 0, fontSize: 14, color: '#374151', lineHeight: 1.6 }}>{selected.currentAddress}</p>
                    </div>
                  )}
                  {selected.address && (
                    <div style={{ marginBottom: 12, padding: '12px 14px', background: '#f9fafb', borderRadius: 10 }}>
                      <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>📌 Main Address</span>
                      <p style={{ margin: 0, fontSize: 14, color: '#374151', lineHeight: 1.6 }}>{selected.address}</p>
                    </div>
                  )}
                  {selected.description && (
                    <div style={{ marginBottom: 12, padding: '12px 14px', background: '#f9fafb', borderRadius: 10 }}>
                      <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>📝 About Company</span>
                      <p style={{ margin: 0, fontSize: 14, color: '#374151', lineHeight: 1.6 }}>{selected.description}</p>
                    </div>
                  )}
                  {selected.approvalStatus === 'REJECTED' && selected.rejectionReason && (
                    <div style={{ padding: '12px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10 }}>
                      <span style={{ fontSize: 11, color: '#ef4444', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>❌ Rejection Reason</span>
                      <p style={{ margin: 0, fontSize: 14, color: '#b91c1c' }}>{selected.rejectionReason}</p>
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'certificate' && (
                selected.certificatePath
                  ? <PdfViewer certPath={selected.certificatePath} />
                  : <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
                      <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
                      <h3 style={{ margin: '0 0 8px', color: '#374151' }}>Certificate Upload Nahi Hua</h3>
                      <p style={{ margin: 0 }}>Company ne abhi certificate upload nahi kiya.</p>
                    </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: '14px 24px', borderTop: '1px solid #f0f0f0', background: '#fafafa' }}>
              {showRejBox && (
                <textarea rows={2} placeholder="Rejection reason likhein..." value={rejReason}
                  onChange={e => setRejReason(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13, resize: 'vertical', fontFamily: 'inherit', marginBottom: 10, boxSizing: 'border-box' }} />
              )}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                {selected.approvalStatus === 'PENDING' && !showRejBox && (<>
                  <button className="btn btn-danger btn-sm" onClick={() => setShowRejBox(true)}>✗ Reject</button>
                  <button className="btn btn-success btn-sm" onClick={() => approve(selected.id)}>✅ Approve</button>
                </>)}
                {selected.approvalStatus === 'PENDING' && showRejBox && (<>
                  <button className="btn btn-outline btn-sm" onClick={() => { setShowRejBox(false); setRejReason(''); }}>Cancel</button>
                  <button className="btn btn-danger btn-sm" disabled={!rejReason.trim()} onClick={() => reject(selected.id, rejReason)}>Confirm Reject</button>
                </>)}
                {selected.approvalStatus === 'APPROVED' && !showRejBox && (
                  <button className="btn btn-danger btn-sm" onClick={() => setShowRejBox(true)}>🚫 Revoke</button>
                )}
                {selected.approvalStatus === 'APPROVED' && showRejBox && (<>
                  <button className="btn btn-outline btn-sm" onClick={() => { setShowRejBox(false); setRejReason(''); }}>Cancel</button>
                  <button className="btn btn-danger btn-sm" disabled={!rejReason.trim()} onClick={() => reject(selected.id, rejReason)}>Confirm Revoke</button>
                </>)}
                {selected.approvalStatus === 'REJECTED' && (
                  <button className="btn btn-success btn-sm" onClick={() => approve(selected.id)}>✅ Re-approve</button>
                )}
                <button className="btn btn-outline btn-sm" onClick={closeModal}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(f => (
          <button key={f} className={`btn ${filter === f ? 'btn-primary' : 'btn-outline'} btn-sm`} onClick={() => setFilter(f)}>
            {f}
            <span style={{ background: filter === f ? 'rgba(255,255,255,0.3)' : 'var(--primary-light)', color: filter === f ? 'white' : 'var(--primary)', borderRadius: 99, padding: '1px 7px', marginLeft: 6, fontSize: 11 }}>
              {f === 'ALL' ? companies.length : companies.filter(c => c.approvalStatus === f).length}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card">
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center' }}><div style={{ fontSize: 32 }}>⏳</div></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">🏢</div><h3>No Companies</h3><p>No companies match this filter.</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Logo</th><th>Company</th><th>GST / CIN</th><th>Industry</th><th>City</th><th>Certificate</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => openModal(c)}>
                    <td onClick={e => e.stopPropagation()}>
                      <div style={{width:36,height:36,borderRadius:8,overflow:'hidden',background:'#f3f4f6',display:'flex',alignItems:'center',justifyContent:'center',border:'1px solid #e5e7eb'}}>
                        {c.logoPath
                          ? <img src={require('../../services/api').getFileUrl(c.logoPath)} alt="logo" style={{width:'100%',height:'100%',objectFit:'contain'}}/>
                          : <span style={{fontSize:18}}>🏢</span>}
                      </div>
                    </td>
                    <td>
                      <strong>{c.companyName}</strong>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.user?.email}</div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>
                      <div>{c.gstNumber}</div>
                      {c.cinNumber && <div style={{color:'#9ca3af',fontSize:11}}>{c.cinNumber}</div>}
                    </td>
                    <td>{c.industry || '—'}</td>
                    <td>{c.city || '—'}</td>
                    <td onClick={e => e.stopPropagation()}>
                      {c.certificatePath
                        ? <span className="badge badge-green" style={{ cursor: 'pointer' }} onClick={() => openModal(c, 'certificate')} title="Click karke certificate dekhein">✓ Uploaded</span>
                        : <span className="badge badge-red">✗ Missing</span>}
                    </td>
                    <td><span className={`badge badge-${STATUS_COLOR[c.approvalStatus]}`}>{c.approvalStatus}</span></td>
                    <td onClick={e => e.stopPropagation()}>
                      <button className="btn btn-outline btn-sm" style={{ marginRight: 6 }} onClick={() => openModal(c)}>👁 View</button>
                      {c.approvalStatus === 'PENDING' && (<>
                        <button className="btn btn-success btn-sm" style={{ marginRight: 4 }} onClick={() => approve(c.id)}>✅</button>
                        <button className="btn btn-danger btn-sm" onClick={() => { openModal(c); setShowRejBox(true); }}>✗</button>
                      </>)}
                      {c.approvalStatus === 'APPROVED' && (
                        <button className="btn btn-danger btn-sm" onClick={() => { openModal(c); setShowRejBox(true); }}>Revoke</button>
                      )}
                      {c.approvalStatus === 'REJECTED' && (
                        <button className="btn btn-success btn-sm" onClick={() => approve(c.id)}>Re-approve</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
        💡 Kisi bhi row ya <strong>👁 View</strong> pe click karein — puri detail aur certificate dekhein, phir approve/reject karein
      </p>
    </Layout>
  );
}
