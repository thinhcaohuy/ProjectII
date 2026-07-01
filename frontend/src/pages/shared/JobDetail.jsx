import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jobPostService, jobApplicationService, candidateService, skillService } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { UserType } from '../../types/enums';
import ApplicationDetailModal from '../../components/ApplicationDetailModal';
import BackHeader from '../../components/BackHeader';
import '../../styles/Dashboard.css';
import '../../styles/JobDetail.css';

export default function JobDetail() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [userApplications, setUserApplications] = useState([]);
  const [hasApplied, setHasApplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  const isEmployer = user?.userType === UserType.EMPLOYER;
  const accountId = user?.accountId || user?.id;

  useEffect(() => {
    loadJobDetail();
  }, [jobId, accountId]);

  const loadJobDetail = async () => {
    setLoading(true);
    try {
      // Fetch job details
      const jobRes = await jobPostService.getById(jobId);
      setJob(jobRes.data);

      // For candidates: load their applications to check if already applied
      if (!isEmployer && accountId) {
        try {
          const candAppsRes = await jobApplicationService.getByCandidate(accountId);
          const candApps = candAppsRes.data || [];
          setUserApplications(candApps);
          
          // Check if user has already applied to this job
          const alreadyApplied = candApps.some(app => {
            const appJobId = app.jobPost?.jobPostId || app.jobPostId;
            return appJobId === jobId;
          });
          setHasApplied(alreadyApplied);
        } catch (err) {
          console.error('Failed to load candidate applications:', err);
          // Don't show error toast, just log it
        }
      }

      // For employers: load applications for this job
      if (isEmployer && accountId) {
        try {
          const appRes = await jobApplicationService.getByJob(jobId, accountId);
          setApplications(appRes.data || []);
        } catch (err) {
          console.error('Failed to load applications:', err);
        }
      }
    } catch (err) {
      console.error('Failed to load job detail:', err);
      showToast('Failed to load job details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    setApplying(true);
    try {
      await jobApplicationService.submit(accountId, jobId, 'I am interested in this position');
      showToast('Application submitted successfully!', 'success');
      setHasApplied(true);
      loadJobDetail();
    } catch (err) {
      console.error('Application error:', err);
      showToast(`Application failed: ${err.response?.data?.message || err.message}`, 'error');
    } finally {
      setApplying(false);
    }
  };

  if (!jobId) {
    return (
      <div className="job-detail-container">
        <button onClick={() => navigate(-1)} className="back-button">← Back</button>
        <div className="error-container">
          <p className="error">Invalid job ID</p>
          <button onClick={() => navigate('/market')} className="action-btn primary">Go to Market</button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="job-detail-container">
        <BackHeader to="/market" text="Back to Market" />
        <p>Loading job details...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="job-detail-container">
        <BackHeader to="/market" text="Back to Market" />
        <div className="error-container">
          <p className="error">Job not found</p>
          <button onClick={() => navigate('/market')} className="action-btn primary">Go to Market</button>
        </div>
      </div>
    );
  }

  const salary = Number(job.salary);
  const isClosed = (job.status || '').toUpperCase() === 'CLOSED';

  return (
    <div className="job-detail-container">
      <BackHeader to="/market" text="Back to Market" />

      <div className="job-detail-grid">
        {/* Main Content Area */}
        <div className="job-detail-main">
          {/* Header Card */}
          <div className="job-detail-header-card">
            <div className="job-detail-title-sec">
              <span className={`job-badge ${isClosed ? 'job-badge--closed' : 'job-badge--open'}`}>
                {isClosed ? 'Closed' : 'Open'}
              </span>
              <h1>{job.title}</h1>
              <p className="job-company">{job.companyName || job.employer?.companyName}</p>
            </div>
          </div>

          {/* Description Section */}
          <section className="job-detail-section">
            <h2 className="section-title">About the Role</h2>
            <div className="job-description">{job.description || 'No description provided'}</div>
          </section>

          {/* Required Skills Section */}
          {job.requiredSkills && (
            <section className="job-detail-section">
              <h2 className="section-title">Skills & Requirements</h2>
              <div className="skills-list">
                {job.requiredSkills.split(',').map((skill, idx) => (
                  <span key={idx} className="skill-badge">{skill.trim()}</span>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar Card */}
        <div className="job-detail-sidebar">
          <div className="sidebar-card">
            {!isEmployer && !isClosed && (
              <button
                onClick={handleApply}
                disabled={applying || hasApplied}
                className={`action-btn-main ${hasApplied ? 'applied' : 'apply'}`}
              >
                {applying ? 'Applying...' : hasApplied ? '✓ Applied' : 'Apply Now'}
              </button>
            )}

            <div className="sidebar-info-list">
              <div className="sidebar-info-item">
                <span className="info-label">Salary</span>
                <span className="info-value highlight">
                  {Number.isFinite(salary) ? `${salary.toLocaleString('en-US')} VND` : 'Negotiable'}
                </span>
              </div>
              <div className="sidebar-info-item">
                <span className="info-label">Location</span>
                <span className="info-value">{job.location || 'Remote'}</span>
              </div>
              <div className="sidebar-info-item">
                <span className="info-label">Industry</span>
                <span className="info-value">{job.industry}</span>
              </div>
              {job.applicationDeadline && (
                <div className="sidebar-info-item">
                  <span className="info-label">Deadline</span>
                  <span className="info-value">
                    {new Date(job.applicationDeadline).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Applications Section (Employer Only) - Full Width Below the Grid */}
      {isEmployer && (
        <div className="employer-applications-section">
          <h2>Applications ({applications.length})</h2>
          {applications.length === 0 ? (
            <p className="empty-state">No applications yet for this position.</p>
          ) : (
            <div className="applications-grid">
              {applications.map(app => (
                <button
                  key={app.applicationId || app.id}
                  onClick={() => setSelectedApplication(app)}
                  className="application-card"
                >
                  <div className="application-card-header">
                    <h3>{app.candidate?.fullName || 'Unknown'}</h3>
                    <span className={`status-badge ${(app.status || '').toLowerCase()}`}>
                      {app.status || 'PENDING'}
                    </span>
                  </div>
                  <p className="application-card-email">{app.candidate?.email}</p>
                  <p className="application-card-date">
                    Applied {new Date(app.createdAt || app.appliedAt).toLocaleDateString()}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Application Detail Modal */}
      {selectedApplication && (
        <ApplicationDetailModal
          application={selectedApplication}
          jobId={jobId}
          onClose={() => setSelectedApplication(null)}
          onStatusChange={() => {
            setSelectedApplication(null);
            loadJobDetail();
          }}
        />
      )}
    </div>
  );
}
