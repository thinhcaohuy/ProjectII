import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { UserType, ApplicationStatus } from '../../types/enums';
import {
  jobPostService,
  jobApplicationService,
  employerService,
  candidateService,
} from '../../services/api';
import { Line, Doughnut } from 'react-chartjs-2';
import { jsPDF } from 'jspdf';
import BackHeader from '../../components/BackHeader';
import '../../styles/Dashboard.css';

export default function AccountStatistics() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [exportType, setExportType] = useState('ALL');
  
  // Ref for charts to export to PDF
  const chartRef1 = useRef(null);
  const chartRef2 = useRef(null);

  // Common stats
  const [profile, setProfile] = useState(null);

  // Candidate stats
  const [candidateData, setCandidateData] = useState({
    applications: [],
    monthlyTrend: {},
    statusBreakdown: { pending: 0, accepted: 0, rejected: 0 }
  });

  // Employer stats
  const [employerData, setEmployerData] = useState({
    jobs: [],
    applications: [],
    monthlyTrend: {},
    statusBreakdown: { pending: 0, accepted: 0, rejected: 0 },
    avgApplicationsPerJob: 0
  });

  const accountId = user?.accountId || user?.id;
  const isEmployer = user?.userType === UserType.EMPLOYER;
  const isCandidate = user?.userType === UserType.CANDIDATE;

  useEffect(() => {
    if (!accountId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        if (isCandidate) {
          const [profileRes, appsRes] = await Promise.all([
            candidateService.getById(accountId),
            jobApplicationService.getByCandidate(accountId)
          ]);

          const apps = appsRes.data || [];

          // Group applications by month
          const monthlyMap = {};
          apps.forEach(app => {
            if (app.appliedAt) {
              const date = new Date(app.appliedAt);
              const key = date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
              monthlyMap[key] = (monthlyMap[key] || 0) + 1;
            }
          });

          // Application statuses
          const statusCount = { pending: 0, accepted: 0, rejected: 0 };
          apps.forEach(app => {
            if (app.status === ApplicationStatus.ACCEPTED) statusCount.accepted++;
            else if (app.status === ApplicationStatus.REJECTED) statusCount.rejected++;
            else statusCount.pending++;
          });

          setProfile(profileRes.data);
          setCandidateData({
            applications: apps,
            monthlyTrend: monthlyMap,
            statusBreakdown: statusCount
          });

        } else if (isEmployer) {
          const [profileRes, jobsRes] = await Promise.all([
            employerService.getById(accountId),
            jobPostService.getByEmployer(accountId)
          ]);

          const jobs = jobsRes.data || [];

          // Fetch applications for all employer jobs
          const appPromises = jobs.map(async job => {
            try {
              const appRes = await jobApplicationService.getByJob(job.jobPostId);
              return appRes.data || [];
            } catch (err) {
              return [];
            }
          });

          const allAppsList = await Promise.all(appPromises);
          const allApps = allAppsList.flat();

          // Group received applications by month
          const monthlyMap = {};
          allApps.forEach(app => {
            if (app.appliedAt) {
              const date = new Date(app.appliedAt);
              const key = date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
              monthlyMap[key] = (monthlyMap[key] || 0) + 1;
            }
          });

          // Application statuses
          const statusCount = { pending: 0, accepted: 0, rejected: 0 };
          allApps.forEach(app => {
            if (app.status === ApplicationStatus.ACCEPTED) statusCount.accepted++;
            else if (app.status === ApplicationStatus.REJECTED) statusCount.rejected++;
            else statusCount.pending++;
          });

          const avgApps = jobs.length ? (allApps.length / jobs.length).toFixed(1) : 0;

          setProfile(profileRes.data);
          setEmployerData({
            jobs,
            applications: allApps,
            monthlyTrend: monthlyMap,
            statusBreakdown: statusCount,
            avgApplicationsPerJob: avgApps
          });
        }
      } catch (err) {
        console.error('Error fetching statistics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [accountId, isCandidate, isEmployer]);

  const handleExportPDF = () => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    let y = 15;

    // Header styling
    doc.setFillColor(15, 98, 254);
    doc.rect(0, 0, 210, 35, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('GENERAL ACCOUNT STATISTICS', 15, 18);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const roleText = isCandidate ? 'Candidate Analytics' : 'Recruitment Analytics';
    const profileName = isCandidate ? (profile?.fullName || 'Candidate') : (profile?.companyName || 'Employer');
    doc.text(`Generated for: ${profileName} (${roleText})`, 15, 25);
    doc.text(`Date: ${new Date().toLocaleString()}`, 15, 30);
    doc.text(`Category scope: ${exportType}`, 15, 33);

    y = 45;
    doc.setTextColor(51, 51, 51);

    if (isCandidate) {
      if (exportType === 'ALL' || exportType === 'APPLICATION') {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text('Application Performance Metrics', 15, y);
        y += 8;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.text(`Total Applications Dispatched: ${candidateData.applications.length}`, 15, y);
        doc.text(`Accepted Offers: ${candidateData.statusBreakdown.accepted}`, 15, y + 6);
        doc.text(`Pending Feedback: ${candidateData.statusBreakdown.pending}`, 15, y + 12);
        doc.text(`Rejected Applications: ${candidateData.statusBreakdown.rejected}`, 15, y + 18);
        y += 28;

        try {
          const chartCanvas2 = chartRef2.current;
          if (chartCanvas2) {
            const chartImg2 = chartCanvas2.toBase64Image();
            doc.setFont('helvetica', 'bold');
            doc.text('Applications Status Distribution', 15, y);
            y += 5;
            doc.addImage(chartImg2, 'PNG', 15, y, 160, 70);
            y += 75;
          }
        } catch (chartErr) {
          console.warn('Failed to embed status chart in PDF', chartErr);
        }
      }

      if (exportType === 'ALL' || exportType === 'MONTHLY_ACTIVITY') {
        if (y > 180) {
          doc.addPage();
          y = 20;
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text('Monthly Activity Timeline', 15, y);
        y += 8;

        try {
          const chartCanvas1 = chartRef1.current;
          if (chartCanvas1) {
            const chartImg1 = chartCanvas1.toBase64Image();
            doc.addImage(chartImg1, 'PNG', 15, y, 180, 80);
            y += 85;
          }
        } catch (chartErr) {
          console.warn('Failed to embed trend chart in PDF', chartErr);
        }
      }
    } else {
      if (exportType === 'ALL' || exportType === 'RECRUITMENT') {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text('Hiring Metrics Dashboard', 15, y);
        y += 8;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.text(`Total Job Listings Posted: ${employerData.jobs.length}`, 15, y);
        doc.text(`Total Applications Received: ${employerData.applications.length}`, 15, y + 6);
        doc.text(`Average Applications Density per post: ${employerData.avgApplicationsPerJob}`, 15, y + 12);
        y += 20;

        doc.setFont('helvetica', 'bold');
        doc.text('Status Funnel Breakdown', 15, y);
        y += 8;

        doc.setFont('helvetica', 'normal');
        doc.text(`Accepted Candidates: ${employerData.statusBreakdown.accepted}`, 15, y);
        doc.text(`Pending Applications: ${employerData.statusBreakdown.pending}`, 15, y + 6);
        doc.text(`Rejected Applications: ${employerData.statusBreakdown.rejected}`, 15, y + 12);
        y += 22;

        try {
          const chartCanvas2 = chartRef2.current;
          if (chartCanvas2) {
            const chartImg2 = chartCanvas2.toBase64Image();
            if (y > 180) {
              doc.addPage();
              y = 20;
            }
            doc.setFont('helvetica', 'bold');
            doc.text('Status Funnel Pie Chart', 15, y);
            y += 5;
            doc.addImage(chartImg2, 'PNG', 15, y, 160, 70);
            y += 75;
          }
        } catch (chartErr) {
          console.warn('Failed to embed status chart in PDF', chartErr);
        }
      }

      if (exportType === 'ALL' || exportType === 'MONTHLY_ACTIVITY') {
        if (y > 180) {
          doc.addPage();
          y = 20;
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text('Monthly Recruitment Trends', 15, y);
        y += 8;

        try {
          const chartCanvas1 = chartRef1.current;
          if (chartCanvas1) {
            const chartImg1 = chartCanvas1.toBase64Image();
            doc.addImage(chartImg1, 'PNG', 15, y, 180, 80);
            y += 85;
          }
        } catch (chartErr) {
          console.warn('Failed to embed trend chart in PDF', chartErr);
        }
      }
    }

    doc.save(`${profileName.replace(/\s+/g, '_')}_General_Analytics_Report.pdf`);
  };

  if (loading) {
    return (
      <div className="as-dashboard-container">
        <div className="as-empty-state">Loading account statistics...</div>
      </div>
    );
  }

  // Construct charts data
  const monthlyLabels = isCandidate 
    ? Object.keys(candidateData.monthlyTrend) 
    : Object.keys(employerData.monthlyTrend);
  const monthlyValues = isCandidate 
    ? Object.values(candidateData.monthlyTrend) 
    : Object.values(employerData.monthlyTrend);

  const trendChartData = {
    labels: monthlyLabels.length > 0 ? monthlyLabels : ['No Data'],
    datasets: [{
      label: isCandidate ? 'Applications Submitted' : 'Applications Received',
      data: monthlyValues.length > 0 ? monthlyValues : [0],
      borderColor: '#0f62fe',
      backgroundColor: 'rgba(15, 98, 254, 0.1)',
      borderWidth: 3,
      fill: true,
      tension: 0.4,
    }],
  };

  const statusBreakdownData = isCandidate ? candidateData.statusBreakdown : employerData.statusBreakdown;
  const statusChartData = {
    labels: ['Accepted', 'Pending', 'Rejected'],
    datasets: [{
      data: [statusBreakdownData.accepted, statusBreakdownData.pending, statusBreakdownData.rejected],
      backgroundColor: ['#10b981', '#fbbf24', '#ef4444'],
      borderColor: ['#059669', '#f59e0b', '#dc2626'],
      borderWidth: 2,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
      },
    },
  };

  return (
    <div className="as-dashboard-container">
      <BackHeader to={isEmployer ? "/employer" : "/candidate"} text="Back to Dashboard" title="Account Statistics" />
      <style>{`
        .as-dashboard-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem 1.5rem;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: #1f2937;
        }
        .as-banner {
          background: linear-gradient(135deg, #0f62fe 0%, #1d4ed8 100%);
          color: #ffffff;
          padding: 2.5rem;
          border-radius: 16px;
          box-shadow: 0 10px 25px -5px rgba(15, 98, 254, 0.2);
          margin-bottom: 2rem;
        }
        .as-banner h1 {
          font-size: 2rem;
          font-weight: 800;
          margin: 0 0 0.5rem 0;
          letter-spacing: -0.025em;
          color: #ffffff;
        }
        .as-banner p {
          color: rgba(255, 255, 255, 0.85);
          font-size: 1.05rem;
          margin: 0;
        }
        .as-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2.5rem;
        }
        .as-stat-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 1.75rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          display: flex;
          flex-direction: column;
        }
        .as-stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.03);
        }
        .as-stat-card.blue { border-top: 5px solid #3b82f6; }
        .as-stat-card.green { border-top: 5px solid #10b981; }
        .as-stat-card.amber { border-top: 5px solid #f59e0b; }
        .as-stat-card.purple { border-top: 5px solid #8b5cf6; }

        .as-stat-value {
          font-size: 2.25rem;
          font-weight: 800;
          color: #111827;
          line-height: 1;
          margin-bottom: 0.5rem;
          letter-spacing: -0.02em;
        }
        .as-stat-label {
          font-size: 0.85rem;
          font-weight: 700;
          color: #4b5563;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.25rem;
        }
        .as-stat-detail {
          font-size: 0.825rem;
          color: #6b7280;
        }
        .as-charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
          gap: 2rem;
          margin-bottom: 2.5rem;
        }
        @media (max-width: 768px) {
          .as-charts-grid {
            grid-template-columns: 1fr;
          }
        }
        .as-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
        }
        .as-card-header {
          margin-bottom: 1.5rem;
        }
        .as-card-kicker {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          color: #6b7280;
          letter-spacing: 0.05em;
          margin: 0 0 0.25rem 0;
        }
        .as-card h2 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #111827;
          margin: 0;
        }
        .as-action-panel {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1.5rem;
          margin-top: 2rem;
        }
        .as-action-info h3 {
          font-size: 1.15rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 0.25rem 0;
        }
        .as-action-info p {
          font-size: 0.9rem;
          color: #475569;
          margin: 0;
        }
        .as-export-btn {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: #ffffff;
          border: none;
          font-weight: 700;
          font-size: 0.95rem;
          border-radius: 8px;
          padding: 0.75rem 2rem;
          cursor: pointer;
          box-shadow: 0 4px 14px 0 rgba(239, 68, 68, 0.3);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .as-export-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px 0 rgba(239, 68, 68, 0.4);
        }
        .as-empty-state {
          padding: 3rem 0;
          text-align: center;
          color: #6b7280;
        }
      `}</style>



      {/* Summary Cards */}
      <div className="as-stats-grid">
        <article className="as-stat-card blue">
          <span className="as-stat-label">
            {isCandidate ? 'Total Applications' : 'Total Postings'}
          </span>
          <span className="as-stat-value">
            {isCandidate ? candidateData.applications.length : employerData.jobs.length}
          </span>
          <span className="as-stat-detail">
            {isCandidate ? 'Submitted records' : 'Company listed roles'}
          </span>
        </article>

        <article className="as-stat-card purple">
          <span className="as-stat-label">
            {isCandidate ? 'Accepted Offers' : 'Applications Volume'}
          </span>
          <span className="as-stat-value">
            {isCandidate ? candidateData.statusBreakdown.accepted : employerData.applications.length}
          </span>
          <span className="as-stat-detail">
            {isCandidate ? 'Applications approved' : 'Total applications received'}
          </span>
        </article>

        <article className="as-stat-card green">
          <span className="as-stat-label">
            {isCandidate ? 'Pending Review' : 'Avg Application Density'}
          </span>
          <span className="as-stat-value">
            {isCandidate ? candidateData.statusBreakdown.pending : employerData.avgApplicationsPerJob}
          </span>
          <span className="as-stat-detail">
            {isCandidate ? 'Applications awaiting decision' : 'Average candidates per role'}
          </span>
        </article>

        <article className="as-stat-card amber">
          <span className="as-stat-label">
            {isCandidate ? 'Rejected Logs' : 'Pending Review'}
          </span>
          <span className="as-stat-value">
            {isCandidate ? candidateData.statusBreakdown.rejected : employerData.statusBreakdown.pending}
          </span>
          <span className="as-stat-detail">
            {isCandidate ? 'Unsuccessful outcomes' : 'Applications awaiting review'}
          </span>
        </article>
      </div>

      {/* Charts Grid */}
      <div className="as-charts-grid">
        <section className="as-card">
          <div className="as-card-header">
            <p className="as-card-kicker">Timeline trend</p>
            <h2>{isCandidate ? 'Submission Frequency' : 'Application Volume'}</h2>
          </div>
          <div style={{ height: '300px', position: 'relative' }}>
            <Line ref={chartRef1} data={trendChartData} options={chartOptions} />
          </div>
        </section>

        <section className="as-card">
          <div className="as-card-header">
            <p className="as-card-kicker">Outcome Analysis</p>
            <h2>Status Distribution</h2>
          </div>
          <div style={{ height: '300px', position: 'relative' }}>
            <Doughnut ref={chartRef2} data={statusChartData} options={chartOptions} />
          </div>
        </section>
      </div>

      {/* Export Options Panel */}
      <section className="as-action-panel">
        <div className="as-action-info">
          <h3>Export PDF Report</h3>
          <p>Download standard analytics report reflecting account activity indicators.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label htmlFor="stats-type-select" style={{ fontSize: '0.8rem', color: '#475569', fontWeight: '700' }}>Statistics Type</label>
            <select
              id="stats-type-select"
              value={exportType}
              onChange={(e) => setExportType(e.target.value)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#1e293b',
                fontWeight: '600',
                outline: 'none',
                cursor: 'pointer',
                minWidth: '220px',
                height: '38px',
                fontSize: '0.9rem'
              }}
            >
              <option value="ALL">All</option>
              {isCandidate ? (
                <>
                  <option value="APPLICATION">Application Statistics</option>
                  <option value="MONTHLY_ACTIVITY">Monthly Activity Statistics</option>
                </>
              ) : (
                <>
                  <option value="RECRUITMENT">Recruitment Statistics</option>
                  <option value="MONTHLY_ACTIVITY">Monthly Activity Statistics</option>
                </>
              )}
            </select>
          </div>
          <button
            onClick={handleExportPDF}
            className="as-export-btn"
            style={{ alignSelf: 'flex-end' }}
          >
            Export PDF
          </button>
        </div>
      </section>
    </div>
  );
}
