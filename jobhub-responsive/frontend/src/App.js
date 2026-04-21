// App.js — Main router
import React from 'react';
import HomePage from './pages/HomePage';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import './index.css';

// Pages
import Login    from './pages/Login';
import Register from './pages/Register';

import StudentDashboard from './pages/student/StudentDashboard';
import JobsPage         from './pages/student/JobsPage';
import SkillsPage       from './pages/student/SkillsPage';
import StudentProfile   from './pages/student/StudentProfile';
import ApplicationsPage from './pages/student/ApplicationsPage';

import CompanyDashboard from './pages/company/CompanyDashboard';
import PostJobPage      from './pages/company/PostJobPage';
import CompanyJobsPage  from './pages/company/CompanyJobsPage';
import ApplicantsPage   from './pages/company/ApplicantsPage';
import CompanyProfile   from './pages/company/CompanyProfile';

import AdminDashboard   from './pages/admin/AdminDashboard';
import StudentsPage     from './pages/admin/StudentsPage';
import CompaniesPage    from './pages/admin/CompaniesPage';
import AdminReports     from './pages/admin/AdminReports';
import AdminApplications from './pages/admin/AdminApplications';

// ── Protected Route ──────────────────────────────────
function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--bg)', fontSize: 24,
    }}>
      <span className="spin">⏳</span>
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    // Redirect to correct dashboard
    if (user.role === 'STUDENT') return <Navigate to="/student/dashboard" replace />;
    if (user.role === 'COMPANY') return <Navigate to="/company/dashboard" replace />;
    if (user.role === 'ADMIN')   return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
}

// ── Public Route (redirect if already logged in) ────
function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) {
    if (user.role === 'STUDENT') return <Navigate to="/student/dashboard" replace />;
    if (user.role === 'COMPANY') return <Navigate to="/company/dashboard" replace />;
    if (user.role === 'ADMIN')   return <Navigate to="/admin/dashboard" replace />;
  }
  return children;
}

function AppRoutes() {
  return (
        <Routes>
          <Route path="/" element={<HomePage />} />
      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Public */}
      <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {/* Student */}
      <Route path="/student/dashboard"   element={<ProtectedRoute role="STUDENT"><StudentDashboard /></ProtectedRoute>} />
      <Route path="/student/profile"     element={<ProtectedRoute role="STUDENT"><StudentProfile /></ProtectedRoute>} />
      <Route path="/student/jobs"        element={<ProtectedRoute role="STUDENT"><JobsPage /></ProtectedRoute>} />
      <Route path="/student/skills"      element={<ProtectedRoute role="STUDENT"><SkillsPage /></ProtectedRoute>} />
      <Route path="/student/applications" element={<ProtectedRoute role="STUDENT"><ApplicationsPage /></ProtectedRoute>} />

      {/* Company */}
      <Route path="/company/dashboard"   element={<ProtectedRoute role="COMPANY"><CompanyDashboard /></ProtectedRoute>} />
      <Route path="/company/profile"     element={<ProtectedRoute role="COMPANY"><CompanyProfile /></ProtectedRoute>} />
      <Route path="/company/post-job"    element={<ProtectedRoute role="COMPANY"><PostJobPage /></ProtectedRoute>} />
      <Route path="/company/jobs"        element={<ProtectedRoute role="COMPANY"><CompanyJobsPage /></ProtectedRoute>} />
      <Route path="/company/applicants"  element={<ProtectedRoute role="COMPANY"><ApplicantsPage /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin/dashboard"     element={<ProtectedRoute role="ADMIN"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/students"      element={<ProtectedRoute role="ADMIN"><StudentsPage /></ProtectedRoute>} />
      <Route path="/admin/companies"     element={<ProtectedRoute role="ADMIN"><CompaniesPage /></ProtectedRoute>} />
      <Route path="/admin/pending"       element={<ProtectedRoute role="ADMIN"><CompaniesPage /></ProtectedRoute>} />
      <Route path="/admin/applications"  element={<ProtectedRoute role="ADMIN"><AdminApplications /></ProtectedRoute>} />
      <Route path="/admin/reports"       element={<ProtectedRoute role="ADMIN"><AdminReports /></ProtectedRoute>} />

      {/* 404 */}
      <Route path="*" element={
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', background: 'var(--bg)',
        }}>
          <div style={{ fontSize: 64 }}>🔍</div>
          <h2 style={{ fontSize: 28, fontWeight: 800, margin: '16px 0 8px' }}>Page Not Found</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>
            The page you're looking for doesn't exist.
          </p>
          <a href="/login" className="btn btn-primary">Go to Login</a>
        </div>
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
