import React, { useEffect, useState } from 'react';
import { jobPostService, jobApplicationService, examService } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { Link } from 'react-router-dom';
import { Bar, Pie, Doughnut } from 'react-chartjs-2';
import LayoutContainer from '../../components/LayoutContainer';
import StatCard from '../../components/StatCard';
import JobPostForm from './JobPostForm';
import EmployerJobCard from './EmployerJobCard';
import '../../styles/Dashboard.css';

export default function MyJobs() {
  const { user } = useAuth();
  const accountId = user?.accountId || user?.id;
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('list'); // list, analytics
  const [jobs, setJobs] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState('all');
  const [filters, setFilters] = useState({ keyword: '' });

  const [formData, setFormData] = useState({
    title: '', industry: '', description: '', requiredSkills: '', salary: '', location: '', applicationDeadline: ''
  });
  const [posting, setPosting] = useState(false);

  const load = async () => {
    if (!accountId) return;
    setLoading(true);
    try {
      const [jobsRes, examsRes] = await Promise.all([
        jobPostService.getByEmployer(accountId),
        examService.getByEmployer(accountId)
      ]);

      const employerJobs = jobsRes.data || [];
      
      // Parse exams to map associated jobs
      const parsedExams = (examsRes.data || []).map(exam => {
        let meta = { assignedJobIds: [] };
        if (exam.rules) {
          try {
            meta = JSON.parse(exam.rules);
          } catch (e) {}
        }
        return { ...exam, assignedJobIds: meta.assignedJobIds || [] };
      });
      setAssessments(parsedExams);

      // Attach applications and assessment count to each job
      const enrichedJobs = await Promise.all(employerJobs.map(async j => {
        let apps = [];
        try {
          const r = await jobApplicationService.getByJob(j.jobPostId, accountId);
          apps = r.data || [];
        } catch (err) {}

        const associatedAssessmentCount = parsedExams.filter(exam =>
          exam.assignedJobIds.includes(j.jobPostId)
        ).length;

        return {
          ...j,
          applications: apps,
          assessmentCount: associatedAssessmentCount
        };
      }));

      setJobs(enrichedJobs);
    } catch (err) {
      console.error('Failed to load jobs data', err);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [accountId]);

  const filteredJobs = jobs.filter(job => {
    const keyword = filters.keyword.trim().toLowerCase();
    const matchesKeyword = !keyword || [job.title, job.industry, job.location, job.description]
      .filter(Boolean)
      .some(value => String(value).toLowerCase().includes(keyword));
    const matchesView = viewMode === 'all' || (job.status || '').toLowerCase() === viewMode.toLowerCase();
    return matchesKeyword && matchesView;
  });

  const openJobsCount = jobs.filter(job => (job.status || '').toUpperCase() === 'OPEN').length;
  const closedJobsCount = jobs.filter(job => (job.status || '').toUpperCase() === 'CLOSED').length;
  const totalApplicationsCount = jobs.reduce((sum, j) => sum + (j.applications?.length || 0), 0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handlePost = async (e) => {
    e.preventDefault();
    setPosting(true);
    try {
      const jobDTO = {
        ...formData,
        salary: parseFloat(formData.salary) || 0,
        applicationDeadline: formData.applicationDeadline ? new Date(formData.applicationDeadline).toISOString() : null
      };

      await jobPostService.create(accountId, jobDTO);
      setFormData({ title: '', industry: '', description: '', requiredSkills: '', salary: '', location: '', applicationDeadline: '' });
      setShowForm(false);
      await load();
      showToast('Job posted successfully!', 'success');
    } catch (err) {
      console.error('Error posting job:', err);
      showToast(`Failed to post job: ${err.message || 'Unknown error'}`, 'error');
    } finally {
      setPosting(false);
    }
  };

  const handleCloseJob = async (jobId) => {
    if (!confirm('Are you sure you want to close this job posting? Candidates will no longer be able to submit applications.')) return;
    try {
      await jobPostService.close(jobId);
      await load();
      showToast('Job posting closed.', 'info');
    } catch (err) {
      console.error('Failed to close job posting', err);
      showToast('Failed to close job posting.', 'error');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!confirm('Are you sure you want to delete this job posting permanently?')) return;
    try {
      await jobPostService.delete(jobId);
      await load();
      showToast('Job posting deleted permanently.', 'info');
    } catch (err) {
      console.error('Failed to delete job posting', err);
      showToast('Failed to delete job posting.', 'error');
    }
  };

  // Chart aggregates for Analytics tab
  const jobTitles = jobs.map(j => j.title);
  const appCounts = jobs.map(j => j.applications?.length || 0);

  const analyticsBarData = {
    labels: jobTitles.length > 0 ? jobTitles : ['No Data'],
    datasets: [{
      label: 'Applications Count',
      data: appCounts.length > 0 ? appCounts : [0],
      backgroundColor: 'rgba(15, 98, 254, 0.7)',
      borderColor: '#0f62fe',
      borderWidth: 1
    }]
  };

  const analyticsPieData = {
    labels: ['Active Openings', 'Closed Postings'],
    datasets: [{
      data: [openJobsCount, closedJobsCount],
      backgroundColor: ['#10b981', '#6b7280'],
      borderColor: ['#059669', '#4b5563'],
      borderWidth: 2
    }]
  };

  return (
    <LayoutContainer
      title="Company Career Listings"
      subtitle="Post and manage job opportunities, screen candidate submittals and view analytics."
    >
      <style>{`
        .as-tabs-container {
          display: flex;
          border-bottom: 1px solid #e5e7eb;
          margin-bottom: 2rem;
          gap: 1.5rem;
        }
        .as-tab-btn {
          padding: 1rem 0.5rem;
          border: none;
          background: none;
          font-size: 1rem;
          font-weight: 600;
          color: #6b7280;
          cursor: pointer;
          position: relative;
          transition: color 0.2s ease;
        }
        .as-tab-btn:hover {
          color: #0f62fe;
        }
        .as-tab-btn.active {
          color: #0f62fe;
        }
        .as-tab-btn.active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          height: 3px;
          background-color: #0f62fe;
          border-radius: 3px 3px 0 0;
        }
        .as-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2.5rem;
        }
        .as-stat-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 1.75rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          display: flex;
          flex-direction: column;
        }
        .as-stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.03);
        }
        .as-stat-card.blue { border-top: 5px solid #3b82f6; }
        .as-stat-card.green { border-top: 5px solid #10b981; }
        .as-stat-card.amber { border-top: 5px solid #f59e0b; }
        .as-stat-card.purple { border-top: 5px solid #8b5cf6; }

        .as-stat-value {
          font-size: 2.25rem;
          font-weight: 800;
          color: #111827;
          line-height: 1;
          margin-bottom: 0.5rem;
          letter-spacing: -0.02em;
        }
        .as-stat-label {
          font-size: 0.85rem;
          font-weight: 700;
          color: #4b5563;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.25rem;
        }
        .as-stat-detail {
          font-size: 0.825rem;
          color: #6b7280;
        }
        .as-charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
          gap: 2rem;
          margin-bottom: 2.5rem;
        }
        @media (max-width: 768px) {
          .as-charts-grid {
            grid-template-columns: 1fr;
          }
        }
        .as-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
        }
        .as-card-header {
          margin-bottom: 1.5rem;
        }
        .as-card-kicker {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          color: #6b7280;
          letter-spacing: 0.05em;
          margin: 0 0 0.25rem 0;
        }
        .as-card h2 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #111827;
          margin: 0;
        }
        .as-table-container {
          overflow-x: auto;
          margin-top: 1rem;
        }
        .as-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
        }
        .as-table th {
          background-color: #f9fafb;
          padding: 1rem;
          font-size: 0.85rem;
          font-weight: 700;
          color: #4b5563;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 2px solid #e5e7eb;
          text-align: left;
        }
        .as-table td {
          padding: 1.25rem 1rem;
          font-size: 0.95rem;
          color: #1f2937;
          border-bottom: 1px solid #f3f4f6;
          transition: background-color 0.2s ease;
          text-align: left;
        }
        .as-table tr:hover td {
          background-color: #f9fafb;
        }
        .as-empty-state {
          padding: 3rem 0;
          text-align: center;
          color: #6b7280;
        }
        .as-export-btn {
          background: linear-gradient(135deg, #0f62fe 0%, #1d4ed8 100%);
          color: #ffffff;
          border: none;
          font-weight: 700;
          font-size: 0.95rem;
          border-radius: 8px;
          padding: 0.75rem 2rem;
          cursor: pointer;
          box-shadow: 0 4px 14px 0 rgba(15, 98, 254, 0.3);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .as-export-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px 0 rgba(15, 98, 254, 0.4);
        }
        .job-detail-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 700;
        }
        .job-detail-badge.apps { background: #e0f2fe; color: #0369a1; }
        .job-detail-badge.exams { background: #f3e8ff; color: #6b21a8; }
      `}</style>

      {/* Stats Summary Cards */}
      <div className="as-stats-grid">
        <StatCard
          label="Total Postings"
          value={jobs.length}
          detail="Listed job offerings"
          color="blue"
        />
        <StatCard
          label="Active Openings"
          value={openJobsCount}
          detail="Currently hiring"
          color="green"
        />
        <StatCard
          label="Total Applications"
          value={totalApplicationsCount}
          detail="Received across all posts"
          color="purple"
        />
        <StatCard
          label="Assigned Assessments"
          value={assessments.length}
          detail="Technical questionnaires"
          color="amber"
        />
      </div>

      {/* Sub Tabs Selection */}
      <div className="as-tabs-container">
        <button
          onClick={() => setActiveSubTab('list')}
          className={`as-tab-btn ${activeSubTab === 'list' ? 'active' : ''}`}
        >
          Active Job Postings
        </button>
        <button
          onClick={() => setActiveSubTab('analytics')}
          className={`as-tab-btn ${activeSubTab === 'analytics' ? 'active' : ''}`}
        >
          Application Analytics Dashboard
        </button>
      </div>

      {loading ? (
        <div className="as-empty-state">Loading company jobs workspace...</div>
      ) : (
        <>
          {activeSubTab === 'list' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              {/* Filters and Actions */}
              <section className="as-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', flex: 1 }}>
                  <input
                    type="text"
                    name="keyword"
                    value={filters.keyword}
                    onChange={handleFilterChange}
                    placeholder="Search by title, location or industry..."
                    style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #cbd5e1', minWidth: '250px' }}
                  />
                  <select
                    value={viewMode}
                    onChange={(e) => setViewMode(e.target.value)}
                    style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="all">All Listings</option>
                    <option value="open">Open Listings</option>
                    <option value="closed">Closed Listings</option>
                  </select>
                </div>
                <button className="as-export-btn" onClick={() => setShowForm(!showForm)}>
                  {showForm ? 'Close Form' : '+ Post New Job'}
                </button>
              </section>

              {/* Add Job Form */}
              {showForm && (
                <section className="as-card">
                  <h2>Post New Hiring Opportunity</h2>
                  <JobPostForm
                    formData={formData}
                    posting={posting}
                    onChange={handleChange}
                    onSubmit={handlePost}
                  />
                </section>
              )}

              {/* Jobs Table Breakdown */}
              <section className="as-card">
                <h2>Company Postings & Metrics</h2>
                {filteredJobs.length === 0 ? (
                  <div className="as-empty-state">No job listings found matching the criteria.</div>
                ) : (
                  <div className="as-table-container">
                    <table className="as-table">
                      <thead>
                        <tr>
                          <th>Job Title</th>
                          <th>Industry</th>
                          <th>Location</th>
                          <th>Salary</th>
                          <th>Status</th>
                          <th>Associated Items</th>
                          <th>Quick Access</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredJobs.map(job => (
                          <tr key={job.jobPostId}>
                            <td style={{ fontWeight: 'bold' }}>{job.title}</td>
                            <td>{job.industry}</td>
                            <td>{job.location}</td>
                            <td style={{ fontWeight: '600' }}>${job.salary?.toLocaleString()}</td>
                            <td>
                              <span className={`assessment-badge ${(job.status || 'open').toLowerCase()}`}>
                                {job.status}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <span className="job-detail-badge apps">{job.applications?.length || 0} applications</span>
                                <span className="job-detail-badge exams">{job.assessmentCount || 0} assessments</span>
                              </div>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <Link
                                  to={`/jobs/${job.jobPostId}`}
                                  style={{ background: '#0f62fe', color: '#fff', textDecoration: 'none', borderRadius: '4px', padding: '0.25rem 0.5rem', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}
                                >
                                  Details
                                </Link>
                                {job.status === 'OPEN' && (
                                  <button
                                    onClick={() => handleCloseJob(job.jobPostId)}
                                    style={{ background: '#e74c3c', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.25rem 0.5rem', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}
                                  >
                                    Close
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteJob(job.jobPostId)}
                                  style={{ background: '#cbd5e1', color: '#1e293b', border: 'none', borderRadius: '4px', padding: '0.25rem 0.5rem', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </div>
          )}

          {activeSubTab === 'analytics' && (
            <div className="as-charts-grid">
              <section className="as-card">
                <div className="as-card-header">
                  <p className="as-card-kicker">Performance metrics</p>
                  <h2>Applications Breakdown by Job Postings</h2>
                </div>
                <div style={{ height: '300px', position: 'relative' }}>
                  <Bar data={analyticsBarData} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
              </section>

              <section className="as-card">
                <div className="as-card-header">
                  <p className="as-card-kicker">Hiring status</p>
                  <h2>Job Postings Overview</h2>
                </div>
                <div style={{ height: '300px', position: 'relative' }}>
                  <Doughnut data={analyticsPieData} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
              </section>
            </div>
          )}
        </>
      )}
    </LayoutContainer>
  );
}
