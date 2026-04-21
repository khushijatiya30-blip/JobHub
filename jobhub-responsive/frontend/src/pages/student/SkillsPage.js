// pages/student/SkillsPage.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { studentAPI, jobAPI } from '../../services/api';

export default function SkillsPage() {
  const navigate = useNavigate();

  const [profile,        setProfile]        = useState(null);
  const [allSkills,      setAllSkills]       = useState([]);
  const [search,         setSearch]          = useState('');
  const [toast,          setToast]           = useState('');
  const [pendingSkills,  setPendingSkills]   = useState([]); // selected but not yet added
  const [adding,         setAdding]          = useState(false);

  useEffect(() => {
    Promise.all([studentAPI.getProfile(), jobAPI.getSkills()])
      .then(([p, s]) => {
        setProfile(p.data.data);
        setAllSkills(s.data.data || []);
      });
  }, []);

  const mySkillIds = new Set(profile?.skills?.map(s => s.id) || []);
  const pendingIds = new Set(pendingSkills.map(s => s.id));

  const showToast = msg => {
    setToast(msg);
    setTimeout(() => setToast(''), 2800);
  };

  /* Toggle pending selection (only for skills NOT already added) */
  const togglePending = (skill) => {
    if (mySkillIds.has(skill.id)) return; // already added — ignore
    setPendingSkills(prev =>
      prev.find(s => s.id === skill.id)
        ? prev.filter(s => s.id !== skill.id)
        : [...prev, skill]
    );
  };

  /* Remove an already-added skill */
  const removeSkill = async skillId => {
    try {
      await studentAPI.removeSkill(skillId);
      const res = await studentAPI.getProfile();
      setProfile(res.data.data);
      showToast('🗑️ Skill removed');
    } catch (err) {
      showToast('❌ ' + (err.response?.data?.message || 'Error'));
    }
  };

  /* Add all pending skills then go to profile */
  const handleAddAndGoProfile = async () => {
    if (pendingSkills.length === 0) {
      navigate('/student/profile');
      return;
    }
    setAdding(true);
    try {
      for (const skill of pendingSkills) {
        await studentAPI.addSkill(skill.id);
      }
      showToast(`✅ ${pendingSkills.length} skill${pendingSkills.length > 1 ? 's' : ''} added!`);
      setPendingSkills([]);
      // small delay so toast is visible, then navigate
      setTimeout(() => navigate('/student/profile'), 700);
    } catch (err) {
      showToast('❌ ' + (err.response?.data?.message || 'Could not add skills'));
      setAdding(false);
    }
  };

  /* Add pending without navigating */
  const handleAddOnly = async () => {
    if (pendingSkills.length === 0) return;
    setAdding(true);
    try {
      for (const skill of pendingSkills) {
        await studentAPI.addSkill(skill.id);
      }
      const res = await studentAPI.getProfile();
      setProfile(res.data.data);
      showToast(`✅ ${pendingSkills.length} skill${pendingSkills.length > 1 ? 's' : ''} added!`);
      setPendingSkills([]);
    } catch (err) {
      showToast('❌ ' + (err.response?.data?.message || 'Could not add skills'));
    } finally {
      setAdding(false);
    }
  };

  const filtered = allSkills.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.category?.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = filtered.reduce((acc, skill) => {
    const cat = skill.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {});

  const hasPending = pendingSkills.length > 0;

  return (
    <Layout title="My Skills" subtitle="Select skills below, then click Add to save">

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          background: 'white', padding: '14px 20px', borderRadius: 10,
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)', fontWeight: 600, fontSize: 14,
        }}>{toast}</div>
      )}

      <div className="student-mid-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* ── LEFT: My Skills ── */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">🎯 My Skills ({profile?.skills?.length || 0})</span>
          </div>
          <div className="card-body">
            {!profile?.skills?.length ? (
              <div className="empty-state" style={{ padding: '20px 0' }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>🎯</div>
                <p>No skills added yet. Browse skills on the right →</p>
              </div>
            ) : (
              <div className="job-skills">
                {profile.skills.map(s => (
                  <div key={s.id} className="skill-chip"
                    style={{ display: 'flex', alignItems: 'center', gap: 6,
                             background: 'var(--primary)', color: 'white' }}>
                    {s.name}
                    <button
                      onClick={() => removeSkill(s.id)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'rgba(255,255,255,0.8)', fontWeight: 900,
                        fontSize: 15, padding: '0 2px', lineHeight: 1,
                      }}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Skill Browser ── */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">🔍 Browse & Select Skills</span>
          </div>
          <div className="card-body">
            <input
              className="form-control"
              placeholder="Search skills or category…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ marginBottom: 16 }}
            />

            <div style={{ maxHeight: 420, overflowY: 'auto', paddingBottom: 8 }}>
              {Object.entries(grouped).map(([cat, skills]) => (
                <div key={cat} style={{ marginBottom: 16 }}>
                  <div style={{
                    fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: 1, color: 'var(--text-muted)', marginBottom: 8,
                  }}>{cat}</div>
                  <div className="job-skills">
                    {skills.map(s => {
                      const isAdded   = mySkillIds.has(s.id);
                      const isPending = pendingIds.has(s.id);
                      return (
                        <div
                          key={s.id}
                          onClick={() => isAdded ? null : togglePending(s)}
                          className="skill-chip"
                          title={isAdded ? 'Already added' : isPending ? 'Click to deselect' : 'Click to select'}
                          style={{
                            cursor: isAdded ? 'default' : 'pointer',
                            background: isAdded   ? 'var(--success)'
                                      : isPending ? '#f59e0b'
                                      : 'var(--primary-light)',
                            color:      isAdded   ? 'white'
                                      : isPending ? 'white'
                                      : 'var(--primary)',
                            border:     isPending ? '2px solid #d97706' : '2px solid transparent',
                            transition: 'all 0.18s',
                            opacity:    isAdded   ? 0.75 : 1,
                          }}
                        >
                          {isAdded ? '✓ ' : isPending ? '☑ ' : '+ '}{s.name}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          STICKY BOTTOM ACTION BAR
          Shows only when skills are selected
          ══════════════════════════════════════════ */}
      <div style={{
        position: 'fixed',
        bottom: 0, left: 0, right: 0,
        zIndex: 500,
        background: 'white',
        borderTop: '2px solid var(--primary-light)',
        boxShadow: '0 -4px 24px rgba(26,86,219,0.13)',
        padding: '14px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        flexWrap: 'wrap',
        transform: hasPending ? 'translateY(0)' : 'translateY(110%)',
        transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        {/* Selected preview chips */}
        <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
            📌 Selected ({pendingSkills.length}):
          </span>
          {pendingSkills.map(s => (
            <span key={s.id} style={{
              background: '#fef3c7', border: '1px solid #f59e0b',
              color: '#92400e', borderRadius: 20, padding: '3px 10px',
              fontSize: 12, fontWeight: 600,
              display: 'inline-flex', alignItems: 'center', gap: 5,
            }}>
              {s.name}
              <button
                onClick={() => setPendingSkills(prev => prev.filter(p => p.id !== s.id))}
                style={{ background: 'none', border: 'none', cursor: 'pointer',
                         color: '#d97706', fontWeight: 900, fontSize: 13, padding: 0, lineHeight: 1 }}>
                ×
              </button>
            </span>
          ))}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
          {/* Cancel */}
          <button
            onClick={() => setPendingSkills([])}
            className="btn btn-outline btn-sm"
            style={{ whiteSpace: 'nowrap' }}
          >
            ✕ Cancel
          </button>

          {/* Add Only */}
          <button
            onClick={handleAddOnly}
            disabled={adding}
            className="btn btn-sm"
            style={{
              background: 'var(--primary-light)', color: 'var(--primary)',
              border: '1px solid var(--primary)', whiteSpace: 'nowrap',
              cursor: adding ? 'not-allowed' : 'pointer',
            }}
          >
            {adding ? '⏳ Adding…' : `✅ Add (${pendingSkills.length})`}
          </button>

          {/* Add & Go to Profile — PRIMARY CTA */}
          <button
            onClick={handleAddAndGoProfile}
            disabled={adding}
            className="btn btn-primary"
            style={{
              whiteSpace: 'nowrap',
              fontWeight: 700,
              cursor: adding ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            {adding ? '⏳ Saving…' : (
              <>✅ Add &amp; Open Profile →</>
            )}
          </button>
        </div>
      </div>

      {/* Bottom spacer so content isn't hidden behind sticky bar when it's open */}
      {hasPending && <div style={{ height: 80 }} />}

    </Layout>
  );
}
