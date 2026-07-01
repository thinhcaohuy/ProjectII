import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { jobApplicationService } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { ApplicationStatus } from '../../types/enums';
import LayoutContainer from '../../components/LayoutContainer';
import StatCard from '../../components/StatCard';
import { formatDate } from '../../utils/formatters';
import '../../styles/Dashboard.css';
import '../../styles/Applications.css';

export default function CandidateApplications() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [applications, setApplications] = useState([]);
  const [filteredApps, setFilteredApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const accountId = user?.accountId || user?.id;

  useEffect(() => {
    if (accountId) {
      loadApplications();
    }
  }, [accountId]);

  useEffect(() => {
    filterApplications();
  }, [applications, statusFilter]);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const res = await jobApplicationService.getByCandidate(accountId);
      const apps = res.data || [];
      apps.sort((a, b) => new Date(b.createdAt || b.appliedAt) - new Date(a.createdAt || a.appliedAt));
      setApplications(apps);
    } catch (err) {
      console.error('Failed to load applications:', err);
      showToast('Failed to load applications', 'error');
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    if (statusFilter === 'all') {
      setFilteredApps(applications);
    } else {
      setFilteredApps(
        applications.filter(app => (app.status || '').toUpperCase() === statusFilter.toUpperCase())
      );
    }
  };

  const getStatusColor = (status) => {
    switch ((status || '').toUpperCase()) {
      case ApplicationStatus.ACCEPTED:
        return '#059669'; // Emerald
      case ApplicationStatus.REJECTED:
        return '#dc2626'; // Red
      case ApplicationStatus.PENDING:
      case 'SUBMITTED':
        return '#d97706'; // Amber
      default:
        return '#4b5563'; // Gray
    }
  };

  const getStatusBgColor = (status) => {
    switch ((status || '').toUpperCase()) {
      case ApplicationStatus.ACCEPTED:
        return '#d1fae5';
      case ApplicationStatus.REJECTED:
        return '#fee2e2';
      case ApplicationStatus.PENDING:
      case 'SUBMITTED':
        return '#fef3c7';
      default:
        return '#f3f4f6';
    }
  };

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === ApplicationStatus.PENDING || a.status === 'SUBMITTED').length,
    accepted: applications.filter(a => a.status === ApplicationStatus.ACCEPTED).length,
    rejected: applications.filter(a => a.status === ApplicationStatus.REJECTED).length,
  };

  return (
    <LayoutContainer
      title="My Applications"
      subtitle="Track and manage your submitted job application processes"
    >
      <style>{`
        .as-stats-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2.5rem;
        }

        .as-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          margin-bottom: 2rem;
        }
        .as-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #f3f4f6;
          padding-bottom: 1.25rem;
          margin-bottom: 1.5rem;
        }
        .as-card-header h2 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #111827;
          margin: 0;
        }

        .as-filter-tabs {
          display: flex;
          gap: 1rem;
          border-bottom: 1px solid #e5e7eb;
          margin-bottom: 1.5rem;
        }
        .as-filter-btn {
          background: none;
          border: none;
          padding: 0.75rem 0.5rem;
          font-size: 0.95rem;
          font-weight: 600;
          color: #6b7280;
          cursor: pointer;
          position: relative;
          transition: color 0.2s;
        }
        .as-filter-btn:hover {
          color: #0f62fe;
        }
        .as-filter-btn.active {
          color: #0f62fe;
        }
        .as-filter-btn.active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          height: 3px;
          background: #0f62fe;
          border-radius: 3px 3px 0 0;
        }

        .as-apps-grid {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .as-app-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 1.5rem;
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          align-items: center;
          gap: 1rem;
          transition: box-shadow 0.2s;
        }
        .as-app-card:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          border-color: #cbd5e1;
        }

        @media (max-width: 768px) {
          .as-app-card {
            grid-template-columns: 1fr;
            gap: 0.75rem;
          }
        }

        .as-app-info h3 {
          font-size: 1.1rem;
          font-weight: 700;
          color: #111827;
          margin: 0 0 0.25rem 0;
        }
        .as-app-info p {
          font-size: 0.9rem;
          color: #4b5563;
          margin: 0;
          font-weight: 500;
        }

        .as-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.35rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          width: fit-content;
        }

        .as-detail-group label {
          font-size: 0.75rem;
          text-transform: uppercase;
          font-weight: 700;
          color: #9ca3af;
          display: block;
          margin-bottom: 0.25rem;
        }
        .as-detail-group span {
          font-size: 0.9rem;
          color: #374151;
          font-weight: 600;
        }

        .as-action-link {
          background: #f1f5f9;
          color: #475569;
          text-decoration: none;
          padding: 0.5rem 1.25rem;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          text-align: center;
          transition: background 0.2s;
        }
        .as-action-link:hover {
          background: #e2e8f0;
          color: #1e293b;
        }

        .as-empty-state {
          padding: 4rem 2rem;
          text-align: center;
          color: #6b7280;
        }
        
        .as-cta-panel {
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          color: #ffffff;
          border-radius: 16px;
          padding: 2.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 2rem;
          margin-top: 2rem;
        }
        .as-cta-text h2 {
          font-size: 1.5rem;
          font-weight: 800;
          margin: 0 0 0.5rem 0;
        }
        .as-cta-text p {
          color: #94a3b8;
          margin: 0;
          font-size: 1rem;
        }
        .as-cta-actions {
          display: flex;
          gap: 1rem;
        }
        .as-btn-cta {
          padding: 0.75rem 1.75rem;
          border-radius: 8px;
          font-weight: 700;
          text-decoration: none;
          font-size: 0.95rem;
          transition: all 0.2s;
        }
        .as-btn-cta.primary {
          background: #0f62fe;
          color: white;
        }
        .as-btn-cta.primary:hover {
          background: #0b4fc2;
        }
        .as-btn-cta.outline {
          border: 1px solid #475569;
          color: #cbd5e1;
        }
        .as-btn-cta.outline:hover {
          background: rgba(255,255,255,0.05);
          color: white;
        }
      `}</style>

      {/* Statistics Cards */}
      <section className="as-stats-row">
        <StatCard label="Total Applications" value={stats.total} detail="Submitted to employers" color="blue" />
        <StatCard label="Pending Review" value={stats.pending} detail="Awaiting HR screening" color="amber" />
        <StatCard label="Shortlisted / Accepted" value={stats.accepted} detail="Passed initial screening" color="green" />
        <StatCard label="Archived / Rejected" value={stats.rejected} detail="Keep exploring matches" color="red" />
      </section>

      {/* Application Submissions Card */}
      <section className="as-card">
        <div className="as-card-header">
          <h2>Submissions List</h2>
          <span className="as-badge" style={{ backgroundColor: '#eff6ff', color: '#1e40af' }}>
            {filteredApps.length} Application(s) shown
          </span>
        </div>

        {/* Filter Navigation */}
        <div className="as-filter-tabs">
          {['all', 'pending', 'accepted', 'rejected'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`as-filter-btn ${statusFilter === status ? 'active' : ''}`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="as-empty-state">Loading application records...</div>
        ) : filteredApps.length === 0 ? (
          <div className="as-empty-state">
            <h3 style={{ margin: '0 0 0.5rem 0' }}>No submissions found</h3>
            <p style={{ margin: '0 0 1.5rem 0' }}>
              {applications.length === 0
                ? "You haven't submitted any applications yet."
                : `No ${statusFilter} application records match your current filter.`}
            </p>
            <Link to="/market" className="as-action-link" style={{ background: '#0f62fe', color: '#fff' }}>
              Search Market Jobs
            </Link>
          </div>
        ) : (
          <div className="as-apps-grid">
            {filteredApps.map(app => {
              const appTitle = app.jobPostTitle || (app.jobPost && app.jobPost.title) || 'Job Position';
              const appCompany = app.companyName || (app.jobPost && app.jobPost.companyName) || 'Employer';
              const appDate = formatDate(app.createdAt || app.appliedAt || Date.now());
              const appStatus = app.status || 'SUBMITTED';

              return (
                <article key={app.applicationId || app.id} className="as-app-card">
                  <div className="as-app-info">
                    <h3>{appTitle}</h3>
                    <p>{appCompany}</p>
                  </div>

                  <div className="as-detail-group">
                    <label>Date Applied</label>
                    <span>{appDate}</span>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, color: '#9ca3af', display: 'block', marginBottom: '0.25rem' }}>Status</label>
                    <span className="as-badge" style={{ backgroundColor: getStatusBgColor(appStatus), color: getStatusColor(appStatus) }}>
                      {ApplicationStatus.getDisplayName(appStatus) || 'Pending'}
                    </span>
                  </div>

                  <Link
                    to={`/jobs/${app.jobPostId || (app.jobPost && (app.jobPost.jobPostId || app.jobPost.id))}`}
                    className="as-action-link"
                  >
                    View Listing
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* CTA Footer Section */}
      {applications.length > 0 && (
        <section className="as-cta-panel">
          <div className="as-cta-text">
            <h2>Keep building your career trajectory</h2>
            <p>Continue researching top tech companies and submitting your candidacy profile.</p>
          </div>
          <div className="as-cta-actions">
            <Link to="/market" className="as-btn-cta primary">
              Explore Market Jobs
            </Link>
            <Link to="/profile" className="as-btn-cta outline">
              View My Profile
            </Link>
          </div>
        </section>
      )}
    </LayoutContainer>
  );
}
