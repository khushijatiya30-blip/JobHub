// pages/admin/AdminDashboard.js
import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { adminAPI } from '../../services/api';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, Title,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export default function AdminDashboard() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getDashboard()
      .then(res => setStats(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <Layout title="Admin Dashboard">
      <div style={{ textAlign: 'center', padding: 60 }}>
        <div className="spin" style={{ fontSize: 36 }}>⏳</div>
      </div>
    </Layout>
  );

  const statCards = [
    { icon: '👨‍🎓', label: 'Total Students',  value: stats?.totalStudents,     color: 'blue',
      sub: `${stats?.placedStudents} placed` },
    { icon: '🏢', label: 'Companies',          value: stats?.totalCompanies,    color: 'purple',
      sub: `${stats?.approvedCompanies} approved` },
    { icon: '💼', label: 'Active Jobs',         value: stats?.activeJobs,        color: 'green',
      sub: `${stats?.totalJobs} total` },
    { icon: '📋', label: 'Applications',        value: stats?.totalApplications, color: 'orange',
      sub: `${stats?.selectedApplications} selected` },
  ];

  const placementRate = stats?.totalStudents
    ? ((stats.placedStudents / stats.totalStudents) * 100).toFixed(1)
    : 0;

  const pieData = {
    labels: ['Placed', 'Not Placed'],
    datasets: [{
      data: [stats?.placedStudents, (stats?.totalStudents - stats?.placedStudents)],
      backgroundColor: ['#10b981', '#e5e7eb'],
      borderWidth: 0,
    }],
  };

  const barData = {
    labels: ['Students', 'Companies', 'Jobs', 'Applications', 'Selected'],
    datasets: [{
      label: 'Count',
      data: [
        stats?.totalStudents, stats?.totalCompanies,
        stats?.totalJobs, stats?.totalApplications,
        stats?.selectedApplications,
      ],
      backgroundColor: [
        '#1a56db', '#7c3aed', '#10b981', '#f59e0b', '#0ea5e9',
      ],
      borderRadius: 6,
    }],
  };

  return (
    <Layout title="Admin Dashboard" subtitle="Platform overview and analytics">
      {/* Stat Cards */}
      <div className="stat-grid">
        {statCards.map(s => (
          <div key={s.label} className="stat-card">
            <div className={`stat-icon ${s.color}`}>{s.icon}</div>
            <div className="stat-info">
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{s.value ?? '—'}</div>
              <div className="stat-sub">{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="admin-charts-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">📊 Platform Overview</span>
          </div>
          <div className="card-body">
            <div className="chart-container">
              <Bar data={barData} options={{
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } },
              }} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">🎯 Placement Rate</span>
          </div>
          <div className="card-body" style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: 48, fontWeight: 900, color: 'var(--primary)',
              lineHeight: 1, margin: '16px 0 8px',
            }}>
              {placementRate}%
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
              Placement Rate
            </div>
            <div className="chart-container" style={{ height: 180 }}>
              <Pie data={pieData} options={{
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } },
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">⚡ Quick Actions</span>
        </div>
        <div className="card-body">
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a className="btn btn-primary" href="/admin/pending">
              ⏳ Review Pending Companies
            </a>
            <a className="btn btn-outline" href="/admin/students">
              👨‍🎓 View Students
            </a>
            <a className="btn btn-outline" href="/admin/applications">
              📋 View Applications
            </a>
            <a className="btn btn-outline" href="/admin/reports">
              📊 Generate Report
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
}
