import React, { useState, useEffect } from 'react';
import { jobPostService, jobApplicationService, employerService } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { ApplicationStatus, JobPostStatus } from '../../types/enums';
import { Link } from 'react-router-dom';
import { Pie, Bar, Line } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import LayoutContainer from '../../components/LayoutContainer';
import StatCard from '../../components/StatCard';
import '../../styles/Dashboard.css';

export default function EmployerDashboard() {
  const [stats, setStats] = useState({
    totalJobs: 0,
    openJobs: 0,
    totalApplications: 0,
    applicationsPending: 0,
    applicationsAccepted: 0,
    applicationsRejected: 0,
    profile: null,
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.accountId || user?.id) {
      loadDashboardData();
    } else {
      setLoading(false);
    }
  }, [user?.accountId, user?.id]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const accountId = user?.accountId || user?.id;
      const [jobsResponse, profileResponse] = await Promise.all([
        jobPostService.getByEmployer(accountId),
        employerService.getById(accountId),
      ]);

      const jobs = jobsResponse.data || [];
      const openCount = jobs.filter(j => j.status === JobPostStatus.OPEN).length;

      // Get applications for all jobs
      const applicationCounts = await Promise.all(
        jobs.map(async job => {
          try {
            const appResponse = await jobApplicationService.getByJob(job.jobPostId);
            return appResponse.data || [];
          } catch (err) {
            return [];
          }
        })
      );

      const allApplications = applicationCounts.flat();
      const pendingCount = allApplications.filter(a => a.status === ApplicationStatus.SUBMITTED).length;
      const acceptedCount = allApplications.filter(a => a.status === ApplicationStatus.ACCEPTED).length;
      const rejectedCount = allApplications.filter(a => a.status === ApplicationStatus.REJECTED).length;

      setStats({
        totalJobs: jobs.length,
        openJobs: openCount,
        totalApplications: allApplications.length,
        applicationsPending: pendingCount,
        applicationsAccepted: acceptedCount,
        applicationsRejected: rejectedCount,
        profile: profileResponse.data,
      });
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const applicationStatusData = {
    labels: ['Pending', 'Accepted', 'Rejected'],
    datasets: [{
      data: [stats.applicationsPending, stats.applicationsAccepted, stats.applicationsRejected],
      backgroundColor: ['#fbbf24', '#10b981', '#ef4444'],
      borderColor: ['#f59e0b', '#059669', '#dc2626'],
      borderWidth: 2,
    }],
  };

  const jobStatusData = {
    labels: ['Open', 'Closed'],
    datasets: [{
      data: [stats.openJobs, stats.totalJobs - stats.openJobs],
      backgroundColor: ['#10b981', '#6b7280'],
      borderColor: ['#059669', '#4b5563'],
      borderWidth: 2,
    }],
  };

  const mockTrendData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Applications Received',
      data: [5, 8, 6, 9, 7, 4, 3],
      backgroundColor: 'rgba(15, 98, 254, 0.1)',
      borderColor: '#0f62fe',
      borderWidth: 3,
      fill: true,
      tension: 0.4,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
      },
    },
  };

  return (
    <LayoutContainer
      title={`Welcome back, ${stats.profile?.companyName || 'Employer'}!`}
      subtitle="Here's your hiring dashboard and recent activity"
      headerActions={
        <Link to="/account-statistics" className="action-btn primary large" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: '#ffffff', border: 'none', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)' }}>
          Account Statistics
        </Link>
      }
    >
      <main className="dashboard-content">

        {/* Key Statistics */}
        <section className="dashboard-panel dashboard-panel--wide">
          <div className="panel-heading">
            <div>
              <p className="panel-kicker">Statistics</p>
              <h2>Your hiring metrics</h2>
            </div>
            <span className="status-badge success">Employer</span>
          </div>

          {loading ? (
            <p>Loading statistics...</p>
          ) : (
            <div className="as-stats-row">
              <StatCard label="Posted Jobs" value={stats.totalJobs} detail="Total positions" color="blue" />
              <StatCard label="Open Jobs" value={stats.openJobs} detail="Active listings" color="green" />
              <StatCard label="Applications" value={stats.totalApplications} detail="Total received" color="purple" />
              <StatCard label="Pending" value={stats.applicationsPending} detail="Awaiting review" color="amber" />
            </div>
          )}
        </section>

        {/* Charts Section */}
        <div className="dashboard-grid">
          {/* Application Status Distribution */}
          <section className="dashboard-panel">
            <div className="panel-heading">
              <p className="panel-kicker">Application Status</p>
              <h2>Distribution</h2>
            </div>
            {stats.totalApplications > 0 ? (
              <div className="chart-container">
                <Pie data={applicationStatusData} options={chartOptions} />
              </div>
            ) : (
              <div className="empty-state">
                <p>No applications yet</p>
                <Link to="/post-job" className="action-btn primary">Post a Job</Link>
              </div>
            )}
          </section>

          {/* Job Status Distribution */}
          <section className="dashboard-panel">
            <div className="panel-heading">
              <p className="panel-kicker">Job Status</p>
              <h2>Listings overview</h2>
            </div>
            {stats.totalJobs > 0 ? (
              <div className="chart-container">
                <Pie data={jobStatusData} options={chartOptions} />
              </div>
            ) : (
              <div className="empty-state">
                <p>No jobs posted yet</p>
                <Link to="/post-job" className="action-btn primary">Create First Job</Link>
              </div>
            )}
          </section>
        </div>

        {/* Activity Trend */}
        <section className="dashboard-panel dashboard-panel--wide">
          <div className="panel-heading">
            <p className="panel-kicker">Activity</p>
            <h2>Weekly trend</h2>
          </div>
          <div className="chart-container">
            <Line data={mockTrendData} options={chartOptions} />
          </div>
        </section>

        {/* Tips & Recommendations */}
        <section className="dashboard-panel dashboard-panel--wide">
          <div className="panel-heading">
            <p className="panel-kicker">Best Practices</p>
            <h2>Hiring tips</h2>
          </div>

          <div className="tips-grid">
            <article className="tip-card">
              <div className="tip-icon" aria-hidden="true" />
              <h3>Optimize Job Descriptions</h3>
              <p>Clear and detailed job descriptions attract more qualified candidates and reduce poor matches.</p>
              <Link to="/post-job" className="tip-link">Edit Jobs →</Link>
            </article>

            <article className="tip-card">
              <div className="tip-icon" aria-hidden="true" />
              <h3>Review Applications Promptly</h3>
              <p>Respond to candidates within 24 hours to improve your employer brand and candidate experience.</p>
              <Link to="/employer" className="tip-link">View Applications →</Link>
            </article>

            <article className="tip-card">
              <div className="tip-icon" aria-hidden="true" />
              <h3>Monitor Your Metrics</h3>
              <p>Track application rates and time-to-hire to understand your recruitment effectiveness.</p>
              <Link to="/profile" className="tip-link">Company Profile →</Link>
            </article>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="dashboard-panel dashboard-panel--wide">
          <div className="panel-heading">
            <p className="panel-kicker">Actions</p>
            <h2>Quick Actions</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginTop: '1.25rem' }}>
            <Link to="/post-job" style={{ textDecoration: 'none' }}>
              <article className="tip-card" style={{ cursor: 'pointer', height: '100%', transition: 'transform 0.2s, box-shadow 0.2s', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem' }}>➕</span>
                <h3 style={{ margin: 0, fontSize: '1rem', color: '#0f172a', fontWeight: '700' }}>Create Job</h3>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', lineHeight: '1.4' }}>Post a new opening for talent search</p>
              </article>
            </Link>

            <Link to="/employer/assessments" style={{ textDecoration: 'none' }}>
              <article className="tip-card" style={{ cursor: 'pointer', height: '100%', transition: 'transform 0.2s, box-shadow 0.2s', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem' }}>📝</span>
                <h3 style={{ margin: 0, fontSize: '1rem', color: '#0f172a', fontWeight: '700' }}>Create Assessment</h3>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', lineHeight: '1.4' }}>Set up custom technical candidate screening</p>
              </article>
            </Link>

            <Link to="/employer/jobs" style={{ textDecoration: 'none' }}>
              <article className="tip-card" style={{ cursor: 'pointer', height: '100%', transition: 'transform 0.2s, box-shadow 0.2s', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem' }}>👥</span>
                <h3 style={{ margin: 0, fontSize: '1rem', color: '#0f172a', fontWeight: '700' }}>Review Candidates</h3>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', lineHeight: '1.4' }}>Evaluate and filter applications</p>
              </article>
            </Link>

            <Link to="/employer/jobs" style={{ textDecoration: 'none' }}>
              <article className="tip-card" style={{ cursor: 'pointer', height: '100%', transition: 'transform 0.2s, box-shadow 0.2s', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem' }}>📁</span>
                <h3 style={{ margin: 0, fontSize: '1rem', color: '#0f172a', fontWeight: '700' }}>View Applications</h3>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', lineHeight: '1.4' }}>Manage your incoming resume pool</p>
              </article>
            </Link>
          </div>
        </section>
      </main>
    </LayoutContainer>
  );
}
