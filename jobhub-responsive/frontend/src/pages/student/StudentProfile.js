import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { studentAPI, getFileUrl } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function StudentProfile() {
  const { updateUserName } = useAuth();
  const [profile,         setProfile]         = useState(null);
  const [form,            setForm]            = useState({});
  const [toast,           setToast]           = useState({ msg: '', type: 'success' });
  const [resumeFile,      setResumeFile]      = useState(null);
  const [photoFile,       setPhotoFile]       = useState(null);
  const [photoPreview,    setPhotoPreview]    = useState(null);
  const [saving,          setSaving]          = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadingPhoto,  setUploadingPhoto]  = useState(false);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: 'success' }), 4000);
  };

  const loadProfile = async () => {
    const res = await studentAPI.getProfile();
    const data = res.data.data;
    setProfile(data);
    // ✅ Form mein sirf editable fields rakho — resumePath/profilePhoto mat daalo
    setForm({
      name:           data.name           || '',
      phone:          data.phone          || '',
      branch:         data.branch         || '',
      college:        data.college        || '',
      graduationYear: data.graduationYear || '',
      cgpa:           data.cgpa           || '',
      linkedinUrl:    data.linkedinUrl    || '',
      githubUrl:      data.githubUrl      || '',
      address:        data.address        || '',
    });
  };

  useEffect(() => { loadProfile(); }, []);

  // ✅ FIX: Numeric fields properly parse karo, sirf edited fields bhejo
  const handleUpdate = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name:           form.name           || null,
        phone:          form.phone          || null,
        branch:         form.branch         || null,
        college:        form.college        || null,
        graduationYear: form.graduationYear ? parseInt(form.graduationYear, 10) : null,
        cgpa:           form.cgpa           ? parseFloat(form.cgpa)            : null,
        linkedinUrl:    form.linkedinUrl    || null,
        githubUrl:      form.githubUrl      || null,
        address:        form.address        || null,
      };
      await studentAPI.updateProfile(payload);
      // ✅ HEADER NAAM TURANT UPDATE HOGA
      if (form.name) updateUserName(form.name);
      showToast('✅ Profile updated successfully!');
      await loadProfile();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Server error';
      showToast('❌ Update failed: ' + msg, 'error');
      console.error('Profile update error:', err.response?.data || err);
    } finally {
      setSaving(false);
    }
  };

  // ✅ FIX: Resume direct backend URL se serve hoga
  const handleResumeUpload = async () => {
    if (!resumeFile) return;
    setUploadingResume(true);
    const fd = new FormData();
    fd.append('file', resumeFile);
    try {
      await studentAPI.uploadResume(fd);
      showToast('✅ Resume uploaded successfully!');
      setResumeFile(null);
      const fi = document.getElementById('resume-input');
      if (fi) fi.value = '';
      await loadProfile();
    } catch (err) {
      const msg = err.response?.data?.message || 'PDF only, max 10MB';
      showToast('❌ Upload failed: ' + msg, 'error');
    } finally {
      setUploadingResume(false);
    }
  };

  const handlePhotoUpload = async () => {
    if (!photoFile) return;
    setUploadingPhoto(true);
    const fd = new FormData();
    fd.append('file', photoFile);
    try {
      await studentAPI.uploadPhoto(fd);
      showToast('✅ Photo uploaded!');
      setPhotoFile(null);
      setPhotoPreview(null);
      await loadProfile();
    } catch {
      showToast('❌ Photo upload failed — PNG/JPG only', 'error');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const onPhotoChange = e => {
    const f = e.target.files[0];
    if (!f) return;
    setPhotoFile(f);
    setPhotoPreview(URL.createObjectURL(f));
  };

  // ✅ FIX: getFileUrl from api.js — returns http://localhost:8080/uploads/...
  const photoSrc  = photoPreview || getFileUrl(profile?.profilePhoto);
  const resumeUrl = getFileUrl(profile?.resumePath);

  const toastBg = toast.type === 'error'
    ? { bg: '#fee2e2', border: '#fca5a5', color: '#dc2626' }
    : { bg: '#f0fdf4', border: '#86efac', color: '#16a34a' };

  return (
    <Layout title="My Profile" subtitle="Manage your student profile">
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

        {/* ── Left: Personal Info ── */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">👤 Personal Information</span>
          </div>
          <div className="card-body">
            <form onSubmit={handleUpdate}>
              <div className="profile-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                {[
                  { name: 'name',           label: 'Full Name',       type: 'text'   },
                  { name: 'phone',          label: 'Phone',           type: 'text'   },
                  { name: 'branch',         label: 'Branch / Stream', type: 'text'   },
                  { name: 'college',        label: 'College Name',    type: 'text'   },
                  { name: 'graduationYear', label: 'Graduation Year', type: 'number' },
                  { name: 'cgpa',           label: 'CGPA',            type: 'number', step: '0.01' },
                  { name: 'linkedinUrl',    label: 'LinkedIn URL',    type: 'url'    },
                  { name: 'githubUrl',      label: 'GitHub URL',      type: 'url'    },
                ].map(f => (
                  <div key={f.name} className="form-group">
                    <label className="form-label">{f.label}</label>
                    <input
                      name={f.name} type={f.type} step={f.step}
                      className="form-control"
                      value={form[f.name] || ''}
                      onChange={e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))}
                    />
                  </div>
                ))}
              </div>
              <div className="form-group">
                <label className="form-label">Address</label>
                <input name="address" type="text" className="form-control"
                  value={form.address || ''}
                  onChange={e => setForm(p => ({ ...p, address: e.target.value }))} />
              </div>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? '⏳ Saving…' : '💾 Save Changes'}
              </button>
            </form>
          </div>
        </div>

        {/* ── Right ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Photo */}
          <div className="card">
            <div className="card-header"><span className="card-title">📸 Profile Photo</span></div>
            <div className="card-body" style={{ textAlign: 'center' }}>
              <div style={{
                width: 100, height: 100, borderRadius: '50%', margin: '0 auto 14px',
                overflow: 'hidden', background: '#e5e7eb',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '3px solid var(--primary, #6366f1)'
              }}>
                {photoSrc
                  ? <img src={photoSrc} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={e => { e.target.style.display = 'none'; }} />
                  : <span style={{ fontSize: 40, color: '#9ca3af' }}>👤</span>}
              </div>

              {!profile?.profilePhoto && !photoPreview && (
                <div className="alert alert-info" style={{ marginBottom: 10, fontSize: 12 }}>
                  📷 No photo uploaded yet
                </div>
              )}
              {profile?.profilePhoto && !photoPreview && (
                <div style={{ marginBottom: 10 }}>
                  <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 600 }}>✅ Photo uploaded</span>
                </div>
              )}

              <input type="file" accept=".png,.jpg,.jpeg" className="form-control"
                onChange={onPhotoChange} style={{ marginBottom: 10 }} />
              <button className="btn btn-primary" style={{ width: '100%' }}
                onClick={handlePhotoUpload} disabled={!photoFile || uploadingPhoto}>
                {uploadingPhoto ? '⏳ Uploading…' : '📸 Upload Photo'}
              </button>
            </div>
          </div>

          {/* Resume — ✅ FIXED with direct backend URL */}
          <div className="card">
            <div className="card-header"><span className="card-title">📄 Resume (PDF)</span></div>
            <div className="card-body">
              {resumeUrl ? (
                <div style={{ marginBottom: 12 }}>
                  <div className="alert alert-success" style={{ marginBottom: 8, fontSize: 12 }}>
                    ✅ Resume uploaded
                  </div>
                  <a
                    href={resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline btn-sm"
                    style={{ width: '100%', display: 'block', textAlign: 'center', marginBottom: 6 }}
                  >
                    📄 View / Download Resume
                  </a>
                </div>
              ) : (
                <div className="alert alert-info" style={{ marginBottom: 10, fontSize: 12 }}>
                  📎 No resume uploaded yet
                </div>
              )}
              <input
                id="resume-input" type="file" accept=".pdf"
                className="form-control"
                onChange={e => setResumeFile(e.target.files[0])}
                style={{ marginBottom: 10 }}
              />
              <button className="btn btn-primary" style={{ width: '100%' }}
                onClick={handleResumeUpload} disabled={!resumeFile || uploadingResume}>
                {uploadingResume ? '⏳ Uploading…' : resumeUrl ? '🔄 Replace Resume' : '📤 Upload Resume'}
              </button>
            </div>
          </div>

          {/* Status */}
          <div className="card">
            <div className="card-header"><span className="card-title">📊 Status</span></div>
            <div className="card-body">
              <div style={{ fontSize: 14, display: 'grid', gap: 10 }}>
                {[
                  ['Placement',  profile?.placementStatus?.replace(/_/g, ' ') || '—'],
                  ['Skills',     profile?.skills?.length || 0],
                  ['Resume',     profile?.resumePath  ? '✅ Uploaded' : '❌ Not uploaded'],
                  ['Photo',      profile?.profilePhoto ? '✅ Uploaded' : '❌ Not uploaded'],
                  ['Joined',     profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN') : '—'],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f3f4f6', paddingBottom: 6 }}>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{k}</span>
                    <strong>{v}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
