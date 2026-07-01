import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { jobApplicationService } from '../services/api';
import { ApplicationStatus } from '../types/enums';
import { formatDate } from '../utils/formatters';

export default function ApplicationsList({ candidateId, applications: propApplications }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (propApplications) {
      setApplications(propApplications);
      setLoading(false);
      return;
    }

    const fetch = async () => {
      setLoading(true);
      try {
        const res = await jobApplicationService.getByCandidate(candidateId);
        setApplications(res.data || []);
      } catch (err) {
        console.error('Failed to load applications', err);
        setError('Unable to load applications');
      } finally {
        setLoading(false);
      }
    };

    if (candidateId) fetch();
  }, [candidateId, propApplications]);

  if (propApplications && propApplications.length === 0) return (
    <div className="empty-state">
      <p>No applications.</p>
    </div>
  );

  if (!propApplications) {
    if (loading) return <p>Loading applications...</p>;
    if (error) return <p className="error">{error}</p>;
    if (applications.length === 0) return (
      <div className="empty-state">
        <p>You haven't applied for any jobs yet.</p>
        <Link to="/market" className="action-btn primary small">Find Jobs</Link>
      </div>
    );
  }

  const list = propApplications || applications;

  return (
    <ul className="applications-list" aria-live="polite">
      {list.map(app => (
        <li key={app.id || app.applicationId} className="application-item">
          <div>
            <h3 className="application-title">{app.jobPostTitle || (app.jobPost && app.jobPost.title) || 'Job'}</h3>
            <p className="application-company">{app.companyName || (app.jobPost && app.jobPost.companyName)}</p>
          </div>

          <div className="application-actions">
            <span className={`status-badge ${app.status?.toLowerCase()}`}>{ApplicationStatus.getDisplayName(app.status)}</span>
            <span className="applied-date">{formatDate(app.createdAt || app.appliedAt)}</span>
            <Link to={`/jobs/${app.jobPostId || (app.jobPost && (app.jobPost.jobPostId || app.jobPost.id))}`} className="action-btn small">View</Link>
          </div>
        </li>
      ))}
    </ul>
  );
}
