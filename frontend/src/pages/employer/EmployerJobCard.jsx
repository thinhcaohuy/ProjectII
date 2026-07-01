/**
 * EmployerJobCard.jsx - Job card for employer dashboard with expandable applications
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { JobPostStatus } from '../../types/enums';
import ApplicationsList from '../../components/ApplicationsList';

export function EmployerJobCard({ job, applications, onCloseJob }) {
  const salary = Number(job.salary);

  const isClosed = (job.status || '').toUpperCase() === JobPostStatus.CLOSED;

  return (
    <div className="job-card employer-job-card">
      <div className="job-card__header">
        <div className="job-card__meta">
          <h3>{job.title || 'Untitled position'}</h3>
          <p><strong>Industry:</strong> {job.industry || 'N/A'}</p>
          <p><strong>Location:</strong> {job.location || 'N/A'}</p>
          <p><strong>Salary:</strong> {Number.isFinite(salary) ? `${salary.toLocaleString('en-US')} VND` : 'Negotiable'}</p>
        </div>

        <div className="job-card__actions">
          <span className={`job-badge ${isClosed ? 'job-badge--closed' : 'job-badge--open'}`}>
            {JobPostStatus.getDisplayName(job.status)}
          </span>
          <Link
            to={`/jobs/${job.jobPostId || job.id}`}
            className="action-btn small"
          >
            View Details
          </Link>
          <button
            type="button"
            onClick={() => !isClosed && onCloseJob(job.jobPostId)}
            className={`btn btn--secondary ${isClosed ? 'btn--disabled' : ''}`}
            disabled={isClosed}
            aria-disabled={isClosed}
          >
            {isClosed ? 'Closed' : 'Close Job'}
          </button>
        </div>
      </div>

      <div className="job-card__body">
        <p className="job-description">{job.description?.substring(0, 100)}...</p>
      </div>
    </div>
  );
}

export default EmployerJobCard;

