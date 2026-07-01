/**
 * JobPostForm.jsx - Modernized Job posting form component
 */
import React from 'react';

export function JobPostForm({ formData, loading, onChange, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="job-post-form">
      <div className="form-section">
        <h3 className="section-title">Job Position Details</h3>
        
        <div className="form-row-2col">
          <div className="form-group">
            <label className="form-label">Job Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={onChange}
              placeholder="e.g. Senior Full-Stack Engineer"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Industry / Sector</label>
            <input
              type="text"
              name="industry"
              value={formData.industry}
              onChange={onChange}
              placeholder="e.g. Information Technology"
              className="form-input"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Detailed Job Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={onChange}
            placeholder="Outline the core responsibilities, day-to-day tasks, work model (hybrid/remote), and expectations..."
            rows="6"
            className="form-textarea"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Required Skills & Technologies</label>
          <textarea
            name="requiredSkills"
            value={formData.requiredSkills}
            onChange={onChange}
            placeholder="e.g. React, Node.js, Spring Boot, AWS, Docker (comma-separated)"
            rows="3"
            className="form-textarea"
            required
          />
        </div>

        <div className="form-row-2col">
          <div className="form-group">
            <label className="form-label">Annual Salary (USD)</label>
            <input
              type="number"
              name="salary"
              value={formData.salary}
              onChange={onChange}
              placeholder="e.g. 120000"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={onChange}
              placeholder="e.g. Austin, TX (or Hybrid / Remote)"
              className="form-input"
              required
            />
          </div>
        </div>

        <div className="form-row-2col">
          <div className="form-group">
            <label className="form-label">Application Deadline</label>
            <input
              type="datetime-local"
              name="applicationDeadline"
              value={formData.applicationDeadline}
              onChange={onChange}
              className="form-input"
              required
            />
          </div>
          <div className="form-group empty-filler"></div>
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" disabled={loading} className="btn-post-job">
          {loading ? (
            <span className="btn-spinner-container">
              <span className="btn-spinner"></span>
              Posting...
            </span>
          ) : (
            'Post Job Opportunity'
          )}
        </button>
      </div>
    </form>
  );
}

export default JobPostForm;
