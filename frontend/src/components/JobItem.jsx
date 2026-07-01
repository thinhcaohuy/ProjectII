import React from 'react';
import { Link } from 'react-router-dom';

export default function JobItem({ job, compact = false }) {
  const jobId = job.jobPostId || job.id;
  
  return (
    <article className={`job-item ${compact ? 'compact' : ''}`}>
      <div className="job-main">
        <h3 className="job-title">{job.title}</h3>
        <p className="job-company">{job.companyName || job.employer?.companyName}</p>
        <p className="job-meta">{job.location || 'Remote'} · {job.industry}</p>
      </div>

      <div className="job-actions">
        <span className={`job-badge job-badge--${(job.status||'').toLowerCase()}`}>{job.status || 'UNKNOWN'}</span>
        <Link to={`/jobs/${jobId}`} className="action-btn small">View</Link>
      </div>
    </article>
  );
}
