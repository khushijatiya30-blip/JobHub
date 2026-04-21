// components/Sidebar.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const studentNav = [
  { icon: '🏠', label: 'Dashboard',      path: '/student/dashboard' },
  { icon: '👤', label: 'My Profile',     path: '/student/profile' },
  { icon: '💼', label: 'Browse Jobs',    path: '/student/jobs' },
  { icon: '📋', label: 'My Applications',path: '/student/applications' },
  { icon: '🎯', label: 'My Skills',      path: '/student/skills' },
];

const companyNav = [
  { icon: '🏠', label: 'Dashboard',   path: '/company/dashboard' },
  { icon: '🏢', label: 'My Profile',  path: '/company/profile' },
  { icon: '📢', label: 'Post a Job',  path: '/company/post-job' },
  { icon: '💼', label: 'My Jobs',     path: '/company/jobs' },
  { icon: '👥', label: 'Applicants',  path: '/company/applicants' },
];

const adminNav = [
  { icon: '🏠', label: 'Dashboard',        path: '/admin/dashboard' },
  { icon: '👨‍🎓', label: 'Students',       path: '/admin/students' },
  { icon: '🏢', label: 'Companies',        path: '/admin/companies' },
  { icon: '⏳', label: 'Pending Approvals',path: '/admin/pending' },
  { icon: '📋', label: 'Applications',     path: '/admin/applications' },
  { icon: '📊', label: 'Reports',          path: '/admin/reports' },
];

export default function Sidebar() {
  const { user, logout, isStudent, isCompany, isAdmin } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => { setOpen(false); }, [location.pathname]);

  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const navItems = isStudent() ? studentNav
                 : isCompany() ? companyNav
                 : isAdmin()   ? adminNav
                 : [];

  const roleLabel = isStudent() ? 'Student Portal'
                  : isCompany() ? 'Company Portal'
                  : 'Admin Panel';

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <>
      <button
        className="sidebar-toggle"
        aria-label={open ? 'Close menu' : 'Open menu'}
        onClick={() => setOpen(v => !v)}
      >
        {open ? '✕' : '☰'}
      </button>

      <div
        className={`sidebar-overlay ${open ? 'visible' : ''}`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-icon">🎓</div>
          <div>
            <h2>JobHub</h2>
            <span>{roleLabel}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-title">Navigation</div>
          {navItems.map(item => (
            <div
              key={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="nav-item" style={{ opacity: 0.8, marginBottom: 4 }}>
            <span className="nav-icon">👤</span>
            <span style={{ fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name || user?.email}
            </span>
          </div>
          <div className="nav-item" onClick={handleLogout} style={{ color: '#fca5a5' }}>
            <span className="nav-icon">🚪</span>
            <span>Logout</span>
          </div>
        </div>
      </aside>
    </>
  );
}
