import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { companyAPI, getFileUrl } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function CompanyProfile() {
  const { updateUserName } = useAuth();
  const [profile,       setProfile]       = useState(null);
  const [certFile,      setCertFile]      = useState(null);
  const [logoFile,      setLogoFile]      = useState(null);
  const [logoPreview,   setLogoPreview]   = useState(null);
  const [editing,       setEditing]       = useState(false);
  const [form,          setForm]          = useState({});
  const [toast,         setToast]         = useState({ msg: '', type: 'success' });
  const [saving,        setSaving]        = useState(false);
  const [uploadingCert, setUploadingCert] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: 'success' }), 4000);
  };

  const load = async () => {
    const res = await companyAPI.getProfile();
    const data = res.data.data;
    setProfile(data);
    setForm({
      companyName:    data.companyName    || '',
      cinNumber:      data.cinNumber      || '',
      industry:       data.industry       || '',
      phone:          data.phone          || '',
      website:        data.website        || '',
      city:           data.city           || '',
      state:          data.state          || '',
      address:        data.address        || '',
      currentAddress: data.currentAddress || '',
      description:    data.description    || '',
    });
  };

  useEffect(() => { load(); }, []);

  // ✅ FIX: Sirf required fields bhejo, header naam update karo
  const saveProfile = async () => {
    setSaving(true);
    try {
      const payload = {
        companyName:    form.companyName    || null,
        cinNumber:      form.cinNumber      || null,
        industry:       form.industry       || null,
        phone:          form.phone          || null,
        website:        form.website        || null,
        city:           form.city           || null,
        state:          form.state          || null,
        address:        form.address        || null,
        currentAddress: form.currentAddress || null,
        description:    form.description    || null,
      };
      await companyAPI.updateProfile(payload);
      // ✅ HEADER NAAM TURANT UPDATE
      if (form.companyName) updateUserName(form.companyName);
      showToast('✅ Profile updated successfully!');
      setEditing(false);
      await load();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Server error';
      showToast('❌ Update failed: ' + msg, 'error');
      console.error('Company profile update error:', err.response?.data || err);
    } finally {
      setSaving(false);
    }
  };

  const uploadCert = async () => {
    if (!certFile) return;
    setUploadingCert(true);
    const fd = new FormData();
    fd.append('file', certFile);
    try {
      await companyAPI.uploadCert(fd);
      showToast('✅ Certificate uploaded! Awaiting admin review.');
      setCertFile(null);
      const fi = document.getElementById('cert-input');
      if (fi) fi.value = '';
      await load();
    } catch {
      showToast('❌ Upload failed: PDF only', 'error');
    } finally {
      setUploadingCert(false);
    }
  };

  const onLogoChange = e => {
    const f = e.target.files[0];
    if (!f) return;
    setLogoFile(f);
    setLogoPreview(URL.createObjectURL(f));
  };

  const uploadLogo = async () => {
    if (!logoFile) return;
    setUploadingLogo(true);
    const fd = new FormData();
    fd.append('file', logoFile);
    try {
      await companyAPI.uploadLogo(fd);
      showToast('✅ Logo uploaded!');
      setLogoFile(null);
      setLogoPreview(null);
      await load();
    } catch {
      showToast('❌ Logo upload failed: PNG/JPG only', 'error');
    } finally {
      setUploadingLogo(false);
    }
  };

  // ✅ FIX: getFileUrl returns http://localhost:8080/uploads/... (direct backend)
  const logoSrc = logoPreview || getFileUrl(profile?.logoPath);
  const certUrl = getFileUrl(profile?.certificatePath);

  const STATUS_COLOR = { PENDING: '#f59e0b', APPROVED: '#10b981', REJECTED: '#ef4444' };

  const toastBg = toast.type === 'error'
    ? { bg: '#fee2e2', border: '#fca5a5', color: '#dc2626' }
    : { bg: '#f0fdf4', border: '#86efac', color: '#16a34a' };

  return (
    <Layout title="Company Profile">
      {toast.msg && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          background: toastBg.bg, border: `1px solid ${toastBg.border}`,
          color: toastBg.color, padding: '14px 22px', borderRadius: 12,
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)', fontWeight: 600, fontSize: 14, maxWidth: 340,
        }}>
          {toast.msg}
        </div>
      )}

      <div className="student-mid-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>

        {/* ── Left: Company Details ── */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="card-title">🏢 Company Details</span>
            <button className="btn btn-outline btn-sm" onClick={() => setEditing(e => !e)}>
              {editing ? '✕ Cancel' : '✏️ Edit'}
            </button>
          </div>
          <div className="card-body">

            {/* View Mode */}
            {profile && !editing && (
              <div style={{ display: 'grid', gap: 10, fontSize: 14 }}>
                {[
                  ['🏢 Company Name',  profile.companyName],
                  ['🧾 GST Number',    profile.gstNumber],
                  ['🏛️ CIN Number',    profile.cinNumber      || '—'],
                  ['🏭 Industry',      profile.industry       || '—'],
                  ['📧 Email',         profile.user?.email    || '—'],
                  ['📞 Contact',       profile.phone          || '—'],
                  ['🌐 Website',       profile.website        || '—'],
                  ['📍 Location',      [profile.city, profile.state].filter(Boolean).join(', ') || '—'],
                  ['🏠 Address',       profile.currentAddress || profile.address || '—'],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{k}</span>
                    <strong style={{ textAlign: 'right', maxWidth: '60%', wordBreak: 'break-word' }}>{v}</strong>
                  </div>
                ))}
                {profile.description && (
                  <div style={{ marginTop: 8, padding: '10px 12px', background: '#f9fafb', borderRadius: 8 }}>
                    <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, marginBottom: 6 }}>📝 ABOUT</div>
                    <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6 }}>{profile.description}</p>
                  </div>
                )}
                <div style={{ padding: '10px 12px', background: '#f9fafb', borderRadius: 8 }}>
                  <span style={{ fontWeight: 700, color: STATUS_COLOR[profile.approvalStatus] || '#6b7280' }}>
                    {profile.approvalStatus === 'APPROVED' && '✅ Approved — Job post kar sakte ho'}
                    {profile.approvalStatus === 'PENDING'  && '⏳ Approval Pending — Admin review mein hai'}
                    {profile.approvalStatus === 'REJECTED' && '❌ Rejected'}
                  </span>
                  {profile.rejectionReason && (
                    <p style={{ margin: '4px 0 0', fontSize: 12, color: '#ef4444' }}>Reason: {profile.rejectionReason}</p>
                  )}
                </div>
              </div>
            )}

            {/* Edit Mode */}
            {editing && (
              <div style={{ display: 'grid', gap: 12 }}>
                {[
                  { name: 'companyName',    label: 'Company Name'       },
                  { name: 'cinNumber',      label: 'CIN Number',        placeholder: 'L12345MH2000PLC123456' },
                  { name: 'industry',       label: 'Industry'           },
                  { name: 'phone',          label: 'Contact Phone'      },
                  { name: 'website',        label: 'Website URL',       type: 'url' },
                  { name: 'city',           label: 'City'               },
                  { name: 'state',          label: 'State'              },
                  { name: 'address',        label: 'Registered Address' },
                  { name: 'currentAddress', label: 'Current Address'    },
                ].map(f => (
                  <div key={f.name} className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">{f.label}</label>
                    <input type={f.type || 'text'} className="form-control"
                      placeholder={f.placeholder || ''}
                      value={form[f.name] || ''}
                      onChange={e => setForm(p => ({ ...p, [f.name]: e.target.value }))} />
                  </div>
                ))}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">About Company</label>
                  <textarea className="form-control" rows={4}
                    value={form.description || ''}
                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-primary" onClick={saveProfile} disabled={saving}>
                    {saving ? '⏳ Saving…' : '💾 Save Changes'}
                  </button>
                  <button className="btn btn-outline" onClick={() => setEditing(false)}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Right ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Logo */}
          <div className="card">
            <div className="card-header"><span className="card-title">🖼️ Company Logo</span></div>
            <div className="card-body" style={{ textAlign: 'center' }}>
              <div style={{
                width: 100, height: 100, borderRadius: 12, margin: '0 auto 14px',
                overflow: 'hidden', background: '#f3f4f6',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid var(--border)'
              }}>
                {logoSrc
                  ? <img src={logoSrc} alt="Logo"
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      onError={e => { e.target.style.display = 'none'; }} />
                  : <span style={{ fontSize: 40 }}>🏢</span>}
              </div>
              {!profile?.logoPath && !logoPreview && (
                <div className="alert alert-info" style={{ marginBottom: 10, fontSize: 12 }}>No logo uploaded</div>
              )}
              {profile?.logoPath && !logoPreview && (
                <div style={{ marginBottom: 10 }}>
                  <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 600 }}>✅ Logo uploaded</span>
                </div>
              )}
              <input type="file" accept=".png,.jpg,.jpeg" className="form-control"
                onChange={onLogoChange} style={{ marginBottom: 10 }} />
              <button className="btn btn-primary" style={{ width: '100%' }}
                onClick={uploadLogo} disabled={!logoFile || uploadingLogo}>
                {uploadingLogo ? '⏳ Uploading…' : '🖼️ Upload Logo'}
              </button>
            </div>
          </div>

          {/* Certificate — ✅ FIXED with direct backend URL */}
          <div className="card">
            <div className="card-header"><span className="card-title">📄 Registration Certificate</span></div>
            <div className="card-body">
              {certUrl ? (
                <div style={{ marginBottom: 12 }}>
                  <div className="alert alert-success" style={{ marginBottom: 8, fontSize: 12 }}>
                    ✅ Certificate uploaded
                  </div>
                  <a
                    href={certUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline btn-sm"
                    style={{ width: '100%', display: 'block', textAlign: 'center', marginBottom: 6 }}
                  >
                    📄 View / Download Certificate
                  </a>
                </div>
              ) : (
                <div className="alert alert-info" style={{ marginBottom: 10, fontSize: 12 }}>
                  📎 No certificate — Approval ke liye required!
                </div>
              )}
              <input id="cert-input" type="file" accept=".pdf" className="form-control"
                style={{ marginBottom: 10 }}
                onChange={e => setCertFile(e.target.files[0])} />
              <button className="btn btn-primary" style={{ width: '100%' }}
                onClick={uploadCert} disabled={!certFile || uploadingCert}>
                {uploadingCert ? '⏳ Uploading…' : certUrl ? '🔄 Replace Certificate' : '📤 Upload Certificate'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
