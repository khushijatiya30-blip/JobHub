// components/Layout.js
import React from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children, title, subtitle }) {
  const { user } = useAuth();
  const initials = (user?.name || user?.email || 'U')
    .split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <header className="topbar">
          <div>
            <div className="topbar-title">{title || 'Dashboard'}</div>
            {subtitle && <div className="topbar-sub">{subtitle}</div>}
          </div>
          <div className="topbar-right">
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{user?.name || user?.email}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user?.role}</div>
            </div>
            <div className="user-avatar">{initials}</div>
          </div>
        </header>

        <main className="page-content fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
