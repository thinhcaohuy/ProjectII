import React, { useEffect, useState } from 'react';
import { candidateService, skillService, jobApplicationService } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { ApplicationStatus } from '../types/enums';
import '../styles/Dashboard.css';
import '../styles/JobDetail.css';

export default function ApplicationDetailModal({ application, jobId, onClose, onStatusChange }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [candidateDetail, setCandidateDetail] = useState(null);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const candidateId = application.candidateId || application.candidate?.accountId;
  const accountId = user?.accountId || user?.id;

  useEffect(() => {
    loadCandidateData();
  }, [candidateId]);

  const loadCandidateData = async () => {
    setLoading(true);
    try {
      const [candidateRes, skillsRes] = await Promise.all([
        candidateService.getById(candidateId),
        skillService.getByAccount(candidateId)
      ]);
      
      setCandidateDetail(candidateRes.data);
      setSkills(skillsRes.data || []);
    } catch (err) {
      console.error('Failed to load candidate data:', err);
      showToast('Failed to load candidate information', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    try {
      await jobApplicationService.updateStatus(
        application.applicationId || application.id,
        newStatus,
        accountId
      );
      showToast(`Application ${newStatus.toLowerCase()}!`, 'success');
      onStatusChange();
    } catch (err) {
      console.error('Failed to update status:', err);
      showToast(`Failed to update status: ${err.response?.data?.message || err.message}`, 'error');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <p>Loading candidate information...</p>
        </div>
      </div>
    );
  }

  const candidate = candidateDetail || application.candidate;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content modal-large" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{candidate?.fullName || 'Unknown Candidate'}</h2>
          <button onClick={onClose} className="modal-close-btn">×</button>
        </div>

        <div className="modal-body">
          {/* Candidate Contact Info */}
          <section className="candidate-section">
            <h3>Contact Information</h3>
            <div className="candidate-info-grid">
              <div className="info-item">
                <label>Email</label>
                <p><a href={`mailto:${candidate?.email}`}>{candidate?.email}</a></p>
              </div>
              <div className="info-item">
                <label>Phone</label>
                <p>{candidate?.phoneNumber || 'Not provided'}</p>
              </div>
              <div className="info-item">
                <label>Location</label>
                <p>{candidate?.address || 'Not provided'}</p>
              </div>
              <div className="info-item">
                <label>Application Date</label>
                <p>{new Date(application.createdAt || application.appliedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}</p>
              </div>
            </div>
          </section>

          {/* Skills */}
          <section className="candidate-section">
            <h3>Skills</h3>
            {skills.length === 0 ? (
              <p className="empty-state">No skills listed</p>
            ) : (
              <div className="skills-list">
                {skills.map(skill => (
                  <div key={skill.skillId || skill.id} className="skill-item">
                    <span className="skill-badge">{skill.skillName || skill.name}</span>
                    {skill.proficiencyLevel && (
                      <span className="skill-level">{skill.proficiencyLevel}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Application Status */}
          <section className="candidate-section">
            <h3>Application Status</h3>
            <div className="application-status">
              <span className={`status-badge ${(application.status || '').toLowerCase()}`}>
                {ApplicationStatus.getDisplayName(application.status)}
              </span>
              <p className="status-date">
                Status updated {new Date(application.updatedAt || application.createdAt).toLocaleDateString()}
              </p>
            </div>
          </section>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="action-btn secondary">
            Close
          </button>
          {application.status === ApplicationStatus.PENDING && (
            <>
              <button
                onClick={() => handleStatusChange(ApplicationStatus.REJECTED)}
                disabled={updating}
                className="action-btn danger"
              >
                {updating ? 'Updating...' : 'Reject'}
              </button>
              <button
                onClick={() => handleStatusChange(ApplicationStatus.ACCEPTED)}
                disabled={updating}
                className="action-btn success"
              >
                {updating ? 'Updating...' : 'Accept'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
