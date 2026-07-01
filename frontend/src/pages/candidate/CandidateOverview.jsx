import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ApplicationStatus } from '../../types/enums';
import { Link } from 'react-router-dom';
import { Line, Doughnut } from 'react-chartjs-2';
import { jobPostService, jobApplicationService, candidateService } from '../../services/api';
import { invitationService } from '../../services/invitationService';
import Tabs from '../../components/Tabs';
import LayoutContainer from '../../components/LayoutContainer';
import StatCard from '../../components/StatCard';

import '../../styles/Dashboard.css';

export default function CandidateOverview() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    openJobs: 0,
    applicationsSubmitted: 0,
    applicationsPending: 0,
    applicationsAccepted: 0,
    applicationsRejected: 0,
    profile: null,
  });
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobs, applications, profile] = await Promise.all([
          jobPostService.getAll(),
          jobApplicationService.getByCandidate(user?.accountId || user?.id),
          candidateService.getById(user?.accountId || user?.id),
        ]);

        const appList = applications.data || [];
        const jobCount = jobs.data?.filter(j => j.status === 'OPEN').length || 0;

         setStats({
          openJobs: jobCount,
          applicationsSubmitted: appList.length,
          applicationsPending: appList.filter(a => a.status === ApplicationStatus.PENDING).length,
          applicationsAccepted: appList.filter(a => a.status === ApplicationStatus.ACCEPTED).length,
          applicationsRejected: appList.filter(a => a.status === ApplicationStatus.REJECTED).length,
          profile: profile.data,
        });

        // Load active invitations
        const invList = await invitationService.getByCandidate(user?.accountId || user?.id);
        const invs = invList.filter(i => i.status === 'Pending' || i.status === 'Started');
        setPendingInvitations(invs);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.accountId || user?.id) {
      fetchData();
    }
  }, [user]);

  const applicationStatusData = {
    labels: ['Pending', 'Accepted', 'Rejected'],
    datasets: [{
      data: [stats.applicationsPending, stats.applicationsAccepted, stats.applicationsRejected],
      backgroundColor: ['#fbbf24', '#10b981', '#ef4444'],
      borderColor: ['#f59e0b', '#059669', '#dc2626'],
      borderWidth: 2,
    }],
  };

  const mockTrendData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Applications Sent',
      data: [2, 3, 4, 5, 4, 3, 2],
      borderColor: '#0f62fe',
      backgroundColor: 'rgba(15, 98, 254, 0.1)',
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
      title={`Welcome back, ${stats.profile?.fullName || 'Candidate'}!`}
      subtitle="Here's your job search summary for today"
      headerActions={
        <Link to="/account-statistics" className="action-btn primary large" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: '#ffffff', border: 'none', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)' }}>
          Account Statistics
        </Link>
      }
    >
      <main className="dashboard-content">

        {pendingInvitations.length > 0 && (
          <section className="dashboard-panel dashboard-panel--wide" style={{ background: '#fef3c7', border: '1px solid #f59e0b', color: '#78350f', padding: '1.25rem 1.5rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1.5rem 0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div>
              <strong style={{ fontSize: '1rem' }}>🔔 Pending Technical Assessment</strong>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
                You have {pendingInvitations.length} assessment invitation(s) waiting for your submission.
              </p>
            </div>
            <Link to="/candidate/assessments" className="action-btn" style={{ background: '#d97706', color: '#fff', border: 'none', padding: '0.5rem 1.25rem', borderRadius: '6px', fontWeight: 'bold', textDecoration: 'none' }}>
              View Assessments
            </Link>
          </section>
        )}

        {/* Key Statistics */}
        <section className="dashboard-panel dashboard-panel--wide">
          <div className="panel-heading">
            <div>
              <p className="panel-kicker">Statistics</p>
              <h2>Your metrics</h2>
            </div>
            <span className="status-badge success">Candidate</span>
          </div>

          {loading ? (
            <p>Loading statistics...</p>
          ) : (
            <div className="as-stats-row">
              <StatCard label="Open Jobs" value={stats.openJobs} detail="Opportunities available" color="blue" />
              <StatCard label="Applications" value={stats.applicationsSubmitted} detail="Total submitted" color="purple" />
              <StatCard label="Pending" value={stats.applicationsPending} detail="Awaiting response" color="amber" />
              <StatCard label="Accepted" value={stats.applicationsAccepted} detail="Great opportunities" color="green" />
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
            {stats.applicationsSubmitted > 0 ? (
              <div className="chart-container">
                <Doughnut data={applicationStatusData} options={chartOptions} />
              </div>
            ) : (
              <div className="empty-state">
                <p>No applications yet</p>
                <Link to="/market" className="action-btn primary">Start Applying</Link>
              </div>
            )}
          </section>

          {/* Application Trend */}
          <section className="dashboard-panel">
            <div className="panel-heading">
              <p className="panel-kicker">Activity</p>
              <h2>Weekly trend</h2>
            </div>
            <div className="chart-container">
              <Line data={mockTrendData} options={chartOptions} />
            </div>
          </section>
        </div>

        {/* Tips & Actions (Tabbed) */}
        <section className="dashboard-panel dashboard-panel--wide">
          <div className="panel-heading">
            <p className="panel-kicker">Recommendations</p>
            <h2>Quick tips</h2>
          </div>

          <Tabs />
        </section>
      </main>
    </LayoutContainer>
  );
}