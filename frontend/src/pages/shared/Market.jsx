import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { jobPostService } from '../../services/api';
import LayoutContainer from '../../components/LayoutContainer';
import { formatSalary, formatDate } from '../../utils/formatters';
import '../../styles/Home.css';
import '../../styles/Dashboard.css';

export default function Market() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ keyword: '', location: '', industry: '', status: 'OPEN' });

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await jobPostService.searchAdvanced(filters);
      const jobsList = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
      setJobs(jobsList);
    } catch (err) {
      console.error('Failed to load market jobs', err);
      setError('Unable to load jobs right now.');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const onFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <LayoutContainer
      title="Explore Opportunities"
      subtitle="Find your next career step or discover top talents for your business."
    >
      <style>{`
        .as-banner-new {
          background: linear-gradient(135deg, #1e40af 0%, #0f172a 100%);
          color: #ffffff;
          padding: 3rem 2.5rem;
          border-radius: 24px;
          box-shadow: 0 10px 30px rgba(30, 64, 175, 0.12);
          margin-bottom: 2.5rem;
          position: relative;
          overflow: hidden;
        }
        .as-banner-new::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -10%;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%);
          pointer-events: none;
        }
        .as-banner-new h1 {
          font-size: 2.5rem;
          font-weight: 850;
          margin: 0 0 0.75rem 0;
          letter-spacing: -0.03em;
          line-height: 1.15;
        }
        .as-banner-new p {
          color: #93c5fd;
          font-size: 1.15rem;
          font-weight: 500;
          margin: 0;
          max-width: 60ch;
        }
        
        /* Redesigned Search & Filter Section */
        .as-search-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 4px 20px rgba(15, 23, 42, 0.03);
          margin-bottom: 2.5rem;
        }
        .as-search-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr 1fr auto;
          gap: 1.25rem;
          align-items: end;
        }
        .as-input-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .as-input-group label {
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #64748b;
        }
        .as-search-input {
          padding: 0.75rem 1rem;
          border: 1px solid #cbd5e1;
          border-radius: 12px;
          font-size: 0.95rem;
          width: 100%;
          outline: none;
          background-color: #f8fafc;
          color: #0f172a;
          transition: all 0.2s ease;
        }
        .as-search-input:focus {
          border-color: #1d4ed8;
          background-color: #ffffff;
          box-shadow: 0 0 0 4px rgba(29, 78, 216, 0.08);
        }
        
        .as-search-actions {
          display: flex;
          gap: 0.75rem;
        }
        .as-btn {
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.95rem;
          cursor: pointer;
          border: none;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .as-btn.primary {
          background: #1d4ed8;
          color: white;
          box-shadow: 0 4px 12px rgba(29, 78, 216, 0.15);
        }
        .as-btn.primary:hover {
          background: #1e40af;
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(29, 78, 216, 0.25);
        }
        .as-btn.secondary {
          background: #f1f5f9;
          color: #475569;
          border: 1px solid #e2e8f0;
        }
        .as-btn.secondary:hover {
          background: #e2e8f0;
          color: #0f172a;
        }

        /* Job Card Grid */
        .as-jobs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
          gap: 2rem;
        }

        .as-job-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          padding: 1.75rem;
          box-shadow: 0 4px 20px rgba(15, 23, 42, 0.02);
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          height: 100%;
        }
        .as-job-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08);
          border-color: #cbd5e1;
        }
        
        .as-job-header {
          display: flex;
          gap: 1rem;
          align-items: center;
          margin-bottom: 1.25rem;
        }
        .as-company-avatar {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          background: #eff6ff;
          color: #1d4ed8;
          font-weight: 800;
          font-size: 1.4rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #dbeafe;
          flex-shrink: 0;
        }
        .as-job-title {
          font-size: 1.2rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 0.35rem 0;
          line-height: 1.3;
        }
        .as-job-company {
          font-size: 0.95rem;
          color: #64748b;
          font-weight: 600;
          margin: 0;
        }
        
        .as-job-meta-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }
        .as-meta-tag {
          font-size: 0.82rem;
          background: #f1f5f9;
          color: #475569;
          padding: 0.35rem 0.65rem;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-weight: 500;
        }
        .as-meta-tag.salary {
          background: #dcfce7;
          color: #166534;
          font-weight: 700;
        }

        .as-job-desc {
          font-size: 0.9rem;
          color: #475569;
          line-height: 1.6;
          margin: 0 0 1.25rem 0;
        }

        /* Skills tags styling */
        .as-job-skills-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.45rem;
          margin-bottom: 1.25rem;
        }
        .as-skill-tag {
          font-size: 0.78rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          color: #64748b;
          padding: 0.25rem 0.55rem;
          border-radius: 6px;
          font-weight: 600;
        }
        .as-skill-tag-more {
          font-size: 0.78rem;
          color: #1d4ed8;
          font-weight: 700;
          align-self: center;
          margin-left: 0.25rem;
        }

        /* Deadline Display */
        .as-job-deadline {
          font-size: 0.8rem;
          color: #64748b;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          margin-bottom: 1.25rem;
          font-weight: 500;
        }

        .as-job-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid #f1f5f9;
          padding-top: 1.25rem;
          margin-top: auto;
        }
        .as-status-tag {
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          padding: 0.3rem 0.6rem;
          border-radius: 8px;
          letter-spacing: 0.5px;
        }
        .as-status-tag.open {
          background: #dcfce7;
          color: #166534;
        }
        .as-status-tag.closed {
          background: #fee2e2;
          color: #991b1b;
        }
        
        .as-action-link {
          color: #1d4ed8;
          font-weight: 700;
          font-size: 0.92rem;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          transition: all 0.2s ease;
        }
        .as-action-link:hover {
          color: #1e40af;
          transform: translateX(2px);
        }

        .as-empty-state, .as-loading-state {
          padding: 5rem 2rem;
          text-align: center;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 24px;
          color: #64748b;
          box-shadow: 0 4px 20px rgba(15, 23, 42, 0.02);
        }
        .as-empty-state h3, .as-loading-state h3 {
          color: #0f172a;
          font-size: 1.35rem;
          margin-bottom: 0.5rem;
        }

        @media (max-width: 1024px) {
          .as-search-grid {
            grid-template-columns: 1fr 1fr;
          }
          .as-search-actions {
            grid-column: 1 / -1;
            justify-content: flex-end;
          }
        }

        @media (max-width: 640px) {
          .as-search-grid {
            grid-template-columns: 1fr;
          }
          .as-jobs-grid {
            grid-template-columns: 1fr;
          }
          .as-banner-new {
            padding: 2rem 1.5rem;
          }
          .as-banner-new h1 {
            font-size: 1.85rem;
          }
        }
      `}</style>

      {/* Advanced Search / Filters Card */}
      <section className="as-search-card">
        <div className="as-search-grid">
          <div className="as-input-group">
            <label>Keyword</label>
            <input 
              name="keyword" 
              placeholder="e.g. Java, Manager, React" 
              value={filters.keyword} 
              onChange={onFilterChange}
              className="as-search-input"
            />
          </div>
          <div className="as-input-group">
            <label>Location</label>
            <input 
              name="location" 
              placeholder="e.g. Remote, Hanoi, USA" 
              value={filters.location} 
              onChange={onFilterChange}
              className="as-search-input"
            />
          </div>
          <div className="as-input-group">
            <label>Industry</label>
            <input 
              name="industry" 
              placeholder="e.g. Engineering, Sales" 
              value={filters.industry} 
              onChange={onFilterChange}
              className="as-search-input"
            />
          </div>
          <div className="as-input-group">
            <label>Status</label>
            <select 
              name="status" 
              value={filters.status} 
              onChange={onFilterChange}
              className="as-search-input"
            >
              <option value="">All Statuses</option>
              <option value="OPEN">Open Only</option>
              <option value="CLOSED">Closed Only</option>
            </select>
          </div>
          
          <div className="as-search-actions">
            <button onClick={loadJobs} className="as-btn primary">Search</button>
            <button 
              onClick={() => { 
                setFilters({ keyword: '', location: '', industry: '', status: 'OPEN' }); 
              }} 
              className="as-btn secondary"
            >
              Clear
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      {loading ? (
        <div className="as-loading-state">
          <h3>Retrieving job posts...</h3>
          <p>Connecting to employment database.</p>
        </div>
      ) : error ? (
        <div className="as-empty-state" style={{ borderColor: '#fca5a5' }}>
          <h3 style={{ color: '#ef4444' }}>{error}</h3>
          <p>Please check your connection and search again.</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="as-empty-state">
          <h3>No matching jobs found</h3>
          <p>Try resetting the filters or modifying your search parameters.</p>
        </div>
      ) : (
        <div className="as-jobs-grid">
          {jobs.map(job => {
            const jobId = job.jobPostId || job.id;
            const formattedSalary = formatSalary(job.salary);
            return (
              <article key={jobId} className="as-job-card">
                <div>
                  <div className="as-job-header">
                    <div className="as-company-avatar">
                      {(job.companyName || job.employer?.companyName || 'C').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="as-job-title">{job.title}</h3>
                      <p className="as-job-company">{job.companyName || job.employer?.companyName || 'Confidential'}</p>
                    </div>
                  </div>
                  
                  <div className="as-job-meta-tags">
                    <span className="as-meta-tag">📍 {job.location || 'Remote'}</span>
                    <span className="as-meta-tag">💼 {job.industry || 'IT'}</span>
                    <span className="as-meta-tag salary">💵 {formattedSalary}</span>
                  </div>

                  {job.description && (
                    <p className="as-job-desc">
                      {job.description.length > 130 ? job.description.substring(0, 130) + '...' : job.description}
                    </p>
                  )}

                  {/* Skills Section */}
                  {job.requiredSkills && (
                    <div className="as-job-skills-tags">
                      {job.requiredSkills.split(',').slice(0, 3).map((skill, idx) => (
                        <span key={idx} className="as-skill-tag">{skill.trim()}</span>
                      ))}
                      {job.requiredSkills.split(',').length > 3 && (
                        <span className="as-skill-tag-more">+{job.requiredSkills.split(',').length - 3} more</span>
                      )}
                    </div>
                  )}

                  {/* Application Deadline */}
                  {job.applicationDeadline && (
                    <div className="as-job-deadline">
                      📅 Deadline: {formatDate(job.applicationDeadline)}
                    </div>
                  )}
                </div>

                <div className="as-job-footer">
                  <span className={`as-status-tag ${(job.status || 'OPEN').toLowerCase()}`}>
                    {job.status || 'OPEN'}
                  </span>
                  <Link to={`/jobs/${jobId}`} className="as-action-link">
                    View Details →
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </LayoutContainer>
  );
}
