import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { adminAPI, jobAPI } from '../../services/api';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, Title,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export default function AdminReports() {
  const [stats,    setStats]    = useState(null);
  const [students, setStudents] = useState([]);
  const [skills,   setSkills]   = useState([]);

  useEffect(() => {
    Promise.all([
      adminAPI.getReports(),
      adminAPI.getStudents(),
      jobAPI.getSkills(),
    ]).then(([r, s, sk]) => {
      setStats(r.data.data);
      setStudents(s.data.data || []);
      setSkills(sk.data.data || []);
    });
  }, []);

  // Skill demand from student profiles
  const skillCount = {};
  students.forEach(s => {
    s.skills?.forEach(sk => {
      skillCount[sk.name] = (skillCount[sk.name] || 0) + 1;
    });
  });
  const topSkills = Object.entries(skillCount)
    .sort((a,b) => b[1]-a[1]).slice(0,10);

  const barData = {
    labels: topSkills.map(([name]) => name),
    datasets: [{
      label: 'Students with skill',
      data: topSkills.map(([,count]) => count),
      backgroundColor: [
        '#1a56db','#0ea5e9','#7c3aed','#10b981','#f59e0b',
        '#ef4444','#6366f1','#14b8a6','#f97316','#8b5cf6',
      ],
      borderRadius: 6,
    }],
  };

  // Branch distribution
  const branchCount = {};
  students.forEach(s => {
    const b = s.branch || 'Unknown';
    branchCount[b] = (branchCount[b]||0)+1;
  });
  const topBranches = Object.entries(branchCount).sort((a,b)=>b[1]-a[1]).slice(0,6);

  const doughnutData = {
    labels: topBranches.map(([b])=>b),
    datasets:[{
      data: topBranches.map(([,c])=>c),
      backgroundColor:['#1a56db','#0ea5e9','#7c3aed','#10b981','#f59e0b','#ef4444'],
      borderWidth:0,
    }],
  };

  const placementRate = stats?.totalStudents
    ? ((stats.placedStudents/stats.totalStudents)*100).toFixed(1) : 0;

  const handlePrint = () => window.print();

  return (
    <Layout title="Reports & Analytics" subtitle="Platform performance overview">
      {/* Summary Cards */}
      <div className="stat-grid" style={{ marginBottom:28 }}>
        {[
          {icon:'👨‍🎓', label:'Total Students',   value: stats?.totalStudents,     color:'blue'},
          {icon:'✅',   label:'Placed',            value: stats?.placedStudents,    color:'green'},
          {icon:'📊',   label:'Placement Rate',    value: `${placementRate}%`,      color:'purple'},
          {icon:'🏢',   label:'Active Companies',  value: stats?.approvedCompanies, color:'orange'},
          {icon:'💼',   label:'Total Jobs',        value: stats?.totalJobs,         color:'blue'},
          {icon:'📋',   label:'Total Applications',value: stats?.totalApplications, color:'green'},
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className={`stat-icon ${s.color}`}>{s.icon}</div>
            <div className="stat-info">
              <div className="stat-label">{s.label}</div>
              <div className="stat-value" style={{fontSize: typeof s.value==='string' ? 22 : 28}}>
                {s.value ?? '—'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="admin-charts-grid" style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:20, marginBottom:20 }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">🔥 Top Skills in Demand</span>
            <span style={{fontSize:13,color:'var(--text-muted)'}}>Based on student profiles</span>
          </div>
          <div className="card-body">
            <div className="chart-container">
              {topSkills.length > 0
                ? <Bar data={barData} options={{
                    responsive:true, maintainAspectRatio:false,
                    plugins:{ legend:{ display:false } },
                    scales:{ y:{ beginAtZero:true, ticks:{ stepSize:1 } } },
                  }}/>
                : <div className="empty-state"><p>No skill data yet</p></div>
              }
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">🎓 Branch Distribution</span>
          </div>
          <div className="card-body">
            <div className="chart-container">
              {topBranches.length > 0
                ? <Doughnut data={doughnutData} options={{
                    responsive:true, maintainAspectRatio:false,
                    plugins:{ legend:{ position:'bottom' } },
                  }}/>
                : <div className="empty-state"><p>No branch data yet</p></div>
              }
            </div>
          </div>
        </div>
      </div>

      {/* CGPA Analysis */}
      <div className="card" style={{ marginBottom:20 }}>
        <div className="card-header">
          <span className="card-title">📊 CGPA Distribution</span>
        </div>
        <div className="card-body">
          {(() => {
            const buckets = {'9-10':0,'8-9':0,'7-8':0,'6-7':0,'Below 6':0};
            students.forEach(s => {
              if (!s.cgpa) return;
              if (s.cgpa >= 9) buckets['9-10']++;
              else if (s.cgpa >= 8) buckets['8-9']++;
              else if (s.cgpa >= 7) buckets['7-8']++;
              else if (s.cgpa >= 6) buckets['6-7']++;
              else buckets['Below 6']++;
            });
            return (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(120px,1fr))', gap:12 }}>
                {Object.entries(buckets).map(([range, count]) => {
                  const pct = students.length ? Math.round(count/students.length*100) : 0;
                  return (
                    <div key={range} style={{ textAlign:'center', padding:16, background:'var(--bg)', borderRadius:10 }}>
                      <div style={{ fontSize:26, fontWeight:800, color:'var(--primary)' }}>{count}</div>
                      <div style={{ fontSize:12, fontWeight:600, marginTop:4 }}>CGPA {range}</div>
                      <div style={{ fontSize:11, color:'var(--text-muted)' }}>{pct}%</div>
                      <div className="progress" style={{ marginTop:8 }}>
                        <div className="progress-bar" style={{ width:`${pct}%` }}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Export */}
      <div className="card">
        <div className="card-body" style={{ display:'flex', gap:12, alignItems:'center' }}>
          <span style={{ fontWeight:600 }}>Export Report:</span>
          <button className="btn btn-primary" onClick={handlePrint}>🖨️ Print / Save PDF</button>
          <button className="btn btn-outline" onClick={() => {
            const csv = [
              'Metric,Value',
              `Total Students,${stats?.totalStudents}`,
              `Placed Students,${stats?.placedStudents}`,
              `Placement Rate,${placementRate}%`,
              `Total Companies,${stats?.totalCompanies}`,
              `Approved Companies,${stats?.approvedCompanies}`,
              `Total Jobs,${stats?.totalJobs}`,
              `Total Applications,${stats?.totalApplications}`,
            ].join('\n');
            const blob = new Blob([csv], { type:'text/csv' });
            const url  = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = 'placement_report.csv'; a.click();
          }}>📥 Export CSV</button>
        </div>
      </div>
    </Layout>
  );
}
