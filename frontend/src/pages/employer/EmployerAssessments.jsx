import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { examService, jobPostService, candidateService, jobApplicationService } from '../../services/api';
import { invitationService } from '../../services/invitationService';
import LayoutContainer from '../../components/LayoutContainer';
import { formatDate } from '../../utils/formatters';
import '../../styles/Dashboard.css';

export default function EmployerAssessments() {
  const { user } = useAuth();
  const employerId = user?.accountId || user?.id;

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('assessments'); // assessments, results, invitations
  const [assessments, setAssessments] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [results, setResults] = useState([]);

  // Filters for results
  const [filterAssessment, setFilterAssessment] = useState('ALL');
  const [filterJob, setFilterJob] = useState('ALL');

  // Modal / Form States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form Fields
  const [examName, setExamName] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [passingScore, setPassingScore] = useState(70);
  const [status, setStatus] = useState('Draft'); // Draft, Published, Closed
  const [assignedJobIds, setAssignedJobIds] = useState([]);
  const [questions, setQuestions] = useState([
    { questionText: '', options: ['', '', '', ''], correctOptionIndex: 0 }
  ]);

  // Inviting candidates state
  const [inviteCandidateId, setInviteCandidateId] = useState('');
  const [inviteExamId, setInviteExamId] = useState('');
  const [inviteJobId, setInviteJobId] = useState('');
  const [jobApplicants, setJobApplicants] = useState([]);
  const [showApplicantsOnly, setShowApplicantsOnly] = useState(false);

  const handleJobChange = async (jobId) => {
    setInviteJobId(jobId);
    setInviteCandidateId(''); // Reset selected candidate when job context changes
    if (jobId) {
      try {
        const apps = await jobApplicationService.getByJob(jobId, employerId);
        const applicants = (apps.data || []).map(a => a.candidate).filter(Boolean);
        setJobApplicants(applicants);
        setShowApplicantsOnly(true); // Default to filtering candidates by applicants
      } catch (err) {
        console.error('Failed to load job applicants', err);
      }
    } else {
      setJobApplicants([]);
      setShowApplicantsOnly(false);
    }
  };

  // Detailed Candidate Answer Review
  const [selectedResult, setSelectedResult] = useState(null);

  useEffect(() => {
    if (employerId) {
      loadAllData();
    }
  }, [employerId]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [examsRes, jobsRes, candidatesRes] = await Promise.all([
        examService.getByEmployer(employerId),
        jobPostService.getByEmployer(employerId),
        candidateService.getAll()
      ]);

      // Parse rules field (where questions & status are stored as JSON)
      const parsedExams = (examsRes.data || []).map(exam => {
        let meta = { questions: [], status: 'Draft', assignedJobIds: [] };
        if (exam.rules) {
          try {
            meta = JSON.parse(exam.rules);
          } catch (e) {
            // Keep default metadata if rules is not valid JSON
          }
        }

        // Map backend questions if present, translating options objects to strings array
        const questionsMapped = exam.questions && exam.questions.length > 0
          ? exam.questions.map(q => ({
              questionText: q.questionText,
              correctOptionIndex: q.correctOptionIndex,
              options: q.options ? [...q.options].sort((a, b) => a.optionIndex - b.optionIndex).map(o => o.optionText) : []
            }))
          : (meta.questions || []);

        let normalizedStatus = exam.status || meta.status || 'Published';
        if (normalizedStatus) {
          const lower = normalizedStatus.toLowerCase();
          if (lower === 'published') normalizedStatus = 'Published';
          else if (lower === 'closed') normalizedStatus = 'Closed';
          else normalizedStatus = 'Draft';
        }

        return {
          ...exam,
          examId: exam.assessmentId || exam.examId,
          examName: exam.title || exam.examName,
          questions: questionsMapped,
          status: normalizedStatus,
          assignedJobIds: meta.assignedJobIds || []
        };
      });

      setAssessments(parsedExams);
      setJobs(jobsRes.data || []);
      setCandidates(candidatesRes.data || []);

      // Load invitations from local storage
      const storedInvitations = await invitationService.getByEmployer(employerId);
      setInvitations(storedInvitations);

      // Build results from completed assignments
      const submittedResults = storedInvitations
        .filter(inv => inv.status === 'Submitted')
        .map(inv => ({
          examResultId: inv.id,
          candidate: {
            accountId: inv.candidateId,
            fullName: inv.candidateName,
            email: inv.candidateEmail
          },
          exam: {
            examId: inv.examId
          },
          examName: inv.examName,
          passingScore: inv.passingScore,
          score: inv.score,
          durationMinutes: inv.durationUsed,
          feedback: inv.feedback,
          answers: inv.answers
        }));
      setResults(submittedResults);

    } catch (err) {
      console.error('Failed to load assessment details', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    setQuestions([...questions, { questionText: '', options: ['', '', '', ''], correctOptionIndex: 0 }]);
  };

  const handleRemoveQuestion = (index) => {
    setQuestions(questions.filter((_, idx) => idx !== index));
  };

  const handleQuestionChange = (index, field, value) => {
    const nextQuestions = [...questions];
    if (field === 'questionText') {
      nextQuestions[index].questionText = value;
    } else if (field === 'correctOptionIndex') {
      nextQuestions[index].correctOptionIndex = parseInt(value, 10);
    }
    setQuestions(nextQuestions);
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const nextQuestions = [...questions];
    nextQuestions[qIndex].options[oIndex] = value;
    setQuestions(nextQuestions);
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setExamName('');
    setDurationMinutes(30);
    setPassingScore(70);
    setStatus('Draft');
    setAssignedJobIds([]);
    setQuestions([{ questionText: '', options: ['', '', '', ''], correctOptionIndex: 0 }]);
    setShowCreateModal(true);
  };

  const openEditModal = (exam) => {
    setIsEditing(true);
    setEditingId(exam.examId);
    setExamName(exam.examName);
    setDurationMinutes(exam.durationMinutes);
    setPassingScore(exam.passingScore);
    setStatus(exam.status || 'Draft');
    setAssignedJobIds(exam.assignedJobIds || []);
    setQuestions(exam.questions.length > 0 ? exam.questions : [{ questionText: '', options: ['', '', '', ''], correctOptionIndex: 0 }]);
    setShowCreateModal(true);
  };

  const handleSaveAssessment = async (e) => {
    e.preventDefault();
    if (!examName || questions.some(q => !q.questionText)) {
      alert('Please provide an assessment name and fill out all question texts.');
      return;
    }

    const meta = {
      questions,
      status,
      assignedJobIds
    };

    const examPayload = {
      examName,
      durationMinutes: parseInt(durationMinutes, 10),
      passingScore: parseFloat(passingScore),
      rules: JSON.stringify(meta),
      employer: { accountId: employerId }
    };

    try {
      if (isEditing) {
        await examService.update(editingId, examPayload);
      } else {
        await examService.create(examPayload);
      }
      setShowCreateModal(false);
      loadAllData();
    } catch (err) {
      console.error('Failed to save assessment', err);
      alert('Error saving assessment');
    }
  };

  const handleDeleteAssessment = async (examId) => {
    if (!confirm('Are you sure you want to delete this assessment? This will delete all associated result logs.')) return;
    try {
      await examService.delete(examId);
      loadAllData();
    } catch (err) {
      console.error('Failed to delete assessment', err);
    }
  };

  const handleSendInvitation = async (e) => {
    e.preventDefault();
    if (!inviteCandidateId || !inviteExamId || !inviteJobId) {
      alert('Please select candidate, assessment, and job posting.');
      return;
    }

    const candidate = candidates.find(c => c.accountId === inviteCandidateId);
    const exam = assessments.find(ex => ex.examId === inviteExamId);
    const job = jobs.find(j => j.jobPostId === inviteJobId);

    await invitationService.inviteCandidate(
      inviteCandidateId,
      candidate?.fullName || 'Candidate',
      inviteExamId,
      exam?.examName || 'Assessment',
      inviteJobId,
      job?.title || 'Job Posting',
      employerId
    );

    alert('Assessment invitation sent successfully!');
    setInviteCandidateId('');
    setInviteExamId('');
    setInviteJobId('');
    loadAllData();
  };

  // Filter & Rank candidates
  const filteredResults = results
    .filter(res => {
      const matchExam = filterAssessment === 'ALL' || res.exam?.examId === filterAssessment;
      // Filter by Job requires matching through candidate's invitations or application details
      const inv = invitations.find(i => i.candidateId === res.candidate?.accountId && i.examId === res.exam?.examId);
      const matchJob = filterJob === 'ALL' || (inv && inv.jobPostId === filterJob);
      return matchExam && matchJob;
    })
    .sort((a, b) => b.score - a.score); // Ranking by highest score

  const handleExportCsv = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Rank,Candidate Name,Email,Assessment,Score,Duration (Mins),Status,Job Title\n';

    filteredResults.forEach((res, index) => {
      const inv = invitations.find(i => i.candidateId === res.candidate?.accountId && i.examId === res.exam?.examId);
      const row = [
        index + 1,
        res.candidate?.fullName || 'N/A',
        res.candidate?.email || 'N/A',
        res.examName,
        res.score + '%',
        res.durationMinutes,
        res.score >= res.passingScore ? 'Passed' : 'Failed',
        inv ? inv.jobTitle : 'Direct Link'
      ].join(',');
      csvContent += row + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Assessment_Results.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <LayoutContainer
      title="Assessments Control Panel"
      subtitle="Configure test questions, track invitations, and review applicant performance scorecards"
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

        .assessment-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-weight: 700;
          font-size: 0.8rem;
          text-transform: uppercase;
        }
        .assessment-badge.draft { background: #e2e8f0; color: #475569; }
        .assessment-badge.published { background: #d1fae5; color: #065f46; }
        .assessment-badge.closed { background: #fee2e2; color: #991b1b; }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal-content {
          background: #ffffff;
          padding: 2rem;
          border-radius: 12px;
          max-width: 700px;
          width: 90%;
          max-height: 85vh;
          overflow-y: auto;
          box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
        }
        .question-builder-card {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1rem;
          background: #f8fafc;
        }
        .inv-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-weight: 600;
          font-size: 0.8rem;
        }
        .inv-badge.Pending { background: #fef3c7; color: #d97706; }
        .inv-badge.Started { background: #e0f2fe; color: #0284c7; }
        .inv-badge.Submitted { background: #d1fae5; color: #059669; }
        .inv-badge.Expired { background: #fee2e2; color: #dc2626; }
      `}</style>



      {/* Navigation tabs */}
      <div className="as-tabs-container">
        <button
          onClick={() => setActiveTab('assessments')}
          className={`as-tab-btn ${activeTab === 'assessments' ? 'active' : ''}`}
        >
          Assessments
        </button>
        <button
          onClick={() => setActiveTab('results')}
          className={`as-tab-btn ${activeTab === 'results' ? 'active' : ''}`}
        >
          Candidate Results & Rankings
        </button>
        <button
          onClick={() => setActiveTab('invitations')}
          className={`as-tab-btn ${activeTab === 'invitations' ? 'active' : ''}`}
        >
          Invitations & Tracking
        </button>
      </div>

      {loading ? (
        <div className="as-empty-state">Loading assessment workspace...</div>
      ) : (
        <>
          {/* ASSESSMENTS TAB */}
          {activeTab === 'assessments' && (
            <section className="as-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2>Available Questionnaires</h2>
                <button className="as-export-btn" onClick={openCreateModal}>
                  + Create Assessment
                </button>
              </div>

              {assessments.length === 0 ? (
                <div className="as-empty-state">
                  <p>No assessments published yet. Click above to create your first exam questionnaire.</p>
                </div>
              ) : (
                <div className="as-table-container">
                  <table className="as-table">
                    <thead>
                      <tr>
                        <th>Exam Name</th>
                        <th>Duration</th>
                        <th>Passing Score</th>
                        <th>Questions</th>
                        <th>Status</th>
                        <th>Assigned Jobs</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assessments.map(exam => (
                        <tr key={exam.examId}>
                          <td style={{ fontWeight: 'bold' }}>{exam.examName}</td>
                          <td>{exam.durationMinutes} mins</td>
                          <td>{exam.passingScore}%</td>
                          <td>{exam.questions?.length || 0} items</td>
                          <td>
                            <span className={`assessment-badge ${(exam.status || 'Draft').toLowerCase()}`}>
                              {exam.status || 'Draft'}
                            </span>
                          </td>
                          <td>{exam.assignedJobIds?.length || 0} jobs</td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button 
                                onClick={() => openEditModal(exam)}
                                style={{ background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.25rem 0.5rem', cursor: 'pointer', fontWeight: 'bold' }}
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => handleDeleteAssessment(exam.examId)}
                                style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.25rem 0.5rem', cursor: 'pointer', fontWeight: 'bold' }}
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
          )}

          {/* RESULTS TAB */}
          {activeTab === 'results' && (
            <section className="as-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                <h2>Evaluations & Leaderboard</h2>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {/* Filters */}
                  <select
                    value={filterAssessment}
                    onChange={(e) => setFilterAssessment(e.target.value)}
                    style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="ALL">All Assessments</option>
                    {assessments.map(ex => (
                      <option key={ex.examId} value={ex.examId}>{ex.examName}</option>
                    ))}
                  </select>

                  <select
                    value={filterJob}
                    onChange={(e) => setFilterJob(e.target.value)}
                    style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="ALL">All Jobs</option>
                    {jobs.map(j => (
                      <option key={j.jobPostId} value={j.jobPostId}>{j.title}</option>
                    ))}
                  </select>

                  <button className="as-export-btn" onClick={handleExportCsv} style={{ background: '#10b981', boxShadow: 'none' }}>
                    Export CSV
                  </button>
                </div>
              </div>

              {filteredResults.length === 0 ? (
                <div className="as-empty-state">No candidates have completed this assessment combination yet.</div>
              ) : (
                <div className="as-table-container">
                  <table className="as-table">
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Candidate Name</th>
                        <th>Email</th>
                        <th>Assessment</th>
                        <th>Score</th>
                        <th>Duration</th>
                        <th>Outcome</th>
                        <th>Detail Review</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredResults.map((res, index) => {
                        const inv = invitations.find(i => i.candidateId === res.candidate?.accountId && i.examId === res.exam?.examId);
                        const passed = res.score >= res.passingScore;
                        return (
                          <tr key={res.examResultId}>
                            <td style={{ fontWeight: 'bold', color: index === 0 ? '#f59e0b' : '#4b5563' }}>
                              #{index + 1}
                            </td>
                            <td style={{ fontWeight: 'bold' }}>{res.candidate?.fullName || 'N/A'}</td>
                            <td>{res.candidate?.email || 'N/A'}</td>
                            <td>{res.examName}</td>
                            <td>
                              <span style={{ fontWeight: 'bold', color: passed ? '#10b981' : '#ef4444' }}>
                                {res.score}%
                              </span>
                            </td>
                            <td>{res.durationMinutes} mins</td>
                            <td>
                              <span className={`assessment-badge ${passed ? 'published' : 'closed'}`}>
                                {passed ? 'Passed' : 'Failed'}
                              </span>
                            </td>
                            <td>
                              <button
                                onClick={() => setSelectedResult(res)}
                                style={{ background: '#0f62fe', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.25rem 0.5rem', cursor: 'pointer', fontWeight: 'bold' }}
                              >
                                Review Answers
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {/* INVITATIONS TAB */}
          {activeTab === 'invitations' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
              <section className="as-card" style={{ height: 'fit-content' }}>
                <h2>Invite Candidate</h2>
                <form onSubmit={handleSendInvitation} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.25rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>Select Candidate</label>
                      {inviteJobId && (
                        <label style={{ fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#0f62fe', fontWeight: '600' }}>
                          <input
                            type="checkbox"
                            checked={showApplicantsOnly}
                            onChange={(e) => setShowApplicantsOnly(e.target.checked)}
                          />
                          Applicants only
                        </label>
                      )}
                    </div>
                    <select
                      value={inviteCandidateId}
                      onChange={(e) => setInviteCandidateId(e.target.value)}
                      style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    >
                      <option value="">-- Choose Candidate --</option>
                      {(showApplicantsOnly ? jobApplicants : candidates).map(c => (
                        <option key={c.accountId} value={c.accountId}>{c.fullName} ({c.email})</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>Select Assessment</label>
                    <select
                      value={inviteExamId}
                      onChange={(e) => setInviteExamId(e.target.value)}
                      style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    >
                      <option value="">-- Choose Exam --</option>
                      {assessments.filter(a => a.status === 'Published').map(ex => (
                        <option key={ex.examId} value={ex.examId}>{ex.examName}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>Assign to Job</label>
                    <select
                      value={inviteJobId}
                      onChange={(e) => handleJobChange(e.target.value)}
                      style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    >
                      <option value="">-- Choose Job --</option>
                      {jobs.map(j => (
                        <option key={j.jobPostId} value={j.jobPostId}>{j.title}</option>
                      ))}
                    </select>
                  </div>

                  <button className="as-export-btn" type="submit" style={{ width: '100%', marginTop: '0.5rem' }}>
                    Send Invitation
                  </button>
                </form>
              </section>

              <section className="as-card">
                <h2>Invitation Logs & Realtime Track</h2>
                {invitations.length === 0 ? (
                  <div className="as-empty-state">No invitations dispatched yet.</div>
                ) : (
                  <div className="as-table-container">
                    <table className="as-table">
                      <thead>
                        <tr>
                          <th>Candidate</th>
                          <th>Exam</th>
                          <th>Job Target</th>
                          <th>Status</th>
                          <th>Invited Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invitations.map(inv => (
                          <tr key={inv.id}>
                            <td style={{ fontWeight: 'bold' }}>{inv.candidateName}</td>
                            <td>{inv.examName}</td>
                            <td>{inv.jobTitle}</td>
                            <td>
                              <span className={`inv-badge ${inv.status}`}>
                                {inv.status}
                              </span>
                            </td>
                            <td>{new Date(inv.invitedAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </div>
          )}
        </>
      )}

      {/* CREATE / EDIT ASSESSMENT WIZARD MODAL */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{isEditing ? 'Edit Questionnaire' : 'Design Assessment'}</h2>
            <form onSubmit={handleSaveAssessment} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>Assessment Title</label>
                  <input
                    type="text"
                    value={examName}
                    onChange={(e) => setExamName(e.target.value)}
                    placeholder="e.g. Senior Frontend Engineer Test"
                    style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    required
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="Draft">Draft</option>
                    <option value="Published">Published</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>Duration (Minutes)</label>
                  <input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                    style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    required
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>Passing Score (%)</label>
                  <input
                    type="number"
                    value={passingScore}
                    onChange={(e) => setPassingScore(e.target.value)}
                    style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>Assign to Job Posting(s)</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', maxHeight: '100px', overflowY: 'auto', border: '1px solid #cbd5e1', padding: '0.5rem', borderRadius: '6px' }}>
                  {jobs.map(job => (
                    <label key={job.jobPostId} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem' }}>
                      <input
                        type="checkbox"
                        checked={assignedJobIds.includes(job.jobPostId)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAssignedJobIds([...assignedJobIds, job.jobPostId]);
                          } else {
                            setAssignedJobIds(assignedJobIds.filter(id => id !== job.jobPostId));
                          }
                        }}
                      />
                      {job.title}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '1rem', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.25rem', marginBottom: '1rem' }}>Questions Builder</h3>
                {questions.map((q, qIdx) => (
                  <div key={qIdx} className="question-builder-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Question #{qIdx + 1}</span>
                      {questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestion(qIdx)}
                          style={{ background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '4px', padding: '0.25rem 0.5rem', cursor: 'pointer', fontSize: '0.8rem' }}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={q.questionText}
                      onChange={(e) => handleQuestionChange(qIdx, 'questionText', e.target.value)}
                      placeholder="Enter question wording"
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '0.75rem' }}
                      required
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      {q.options.map((opt, oIdx) => (
                        <input
                          key={oIdx}
                          type="text"
                          value={opt}
                          onChange={(e) => handleOptionChange(qIdx, oIdx, e.target.value)}
                          placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                          style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                          required
                        />
                      ))}
                    </div>
                    <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Correct Answer:</label>
                      <select
                        value={q.correctOptionIndex}
                        onChange={(e) => handleQuestionChange(qIdx, 'correctOptionIndex', e.target.value)}
                        style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                      >
                        <option value={0}>Option A</option>
                        <option value={1}>Option B</option>
                        <option value={2}>Option C</option>
                        <option value={3}>Option D</option>
                      </select>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  style={{ background: '#f1f5f9', color: '#1e293b', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  + Add Question Item
                </button>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{ background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '6px', padding: '0.5rem 1.5rem', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="as-export-btn"
                  style={{ padding: '0.5rem 2rem', height: 'auto' }}
                >
                  Save Assessment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REVIEW CANDIDATE ANSWERS MODAL */}
      {selectedResult && (
        <div className="modal-overlay" onClick={() => setSelectedResult(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <h2>Answer Sheet Review</h2>
            <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Candidate: <strong>{selectedResult.candidate?.fullName}</strong> | Assessment: <strong>{selectedResult.examName}</strong>
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {(() => {
                const exam = assessments.find(ex => ex.examId === selectedResult.exam?.examId);
                const inv = invitations.find(i => i.candidateId === selectedResult.candidate?.accountId && i.examId === selectedResult.exam?.examId);
                const candidateAnswers = inv?.answers || {};

                if (!exam || !exam.questions || exam.questions.length === 0) {
                  return <p>Detailed question structure is unavailable for this historical evaluation.</p>;
                }

                return exam.questions.map((q, idx) => {
                  const candidateChoiceIdx = candidateAnswers[idx];
                  const correctChoiceIdx = q.correctOptionIndex;
                  const isCorrect = candidateChoiceIdx === correctChoiceIdx;

                  return (
                    <div key={idx} style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
                      <p style={{ fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>
                        Q{idx + 1}: {q.questionText}
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.9rem' }}>
                        {q.options.map((opt, oIdx) => {
                          let optStyle = { padding: '0.5rem', borderRadius: '4px', border: '1px solid #e2e8f0' };
                          if (oIdx === correctChoiceIdx) {
                            optStyle.borderColor = '#10b981';
                            optStyle.backgroundColor = '#d1fae5';
                            optStyle.fontWeight = 'bold';
                          } else if (oIdx === candidateChoiceIdx && !isCorrect) {
                            optStyle.borderColor = '#ef4444';
                            optStyle.backgroundColor = '#fee2e2';
                          }
                          return (
                            <div key={oIdx} style={optStyle}>
                              {String.fromCharCode(65 + oIdx)}: {opt}
                            </div>
                          );
                        })}
                      </div>
                      <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', color: isCorrect ? '#059669' : '#b91c1c', fontWeight: 'bold' }}>
                        {isCorrect ? '✓ Correct Answer selected' : `✗ Candidate selected Option ${String.fromCharCode(65 + candidateChoiceIdx)}`}
                      </p>
                    </div>
                  );
                });
              })()}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button
                className="as-export-btn"
                onClick={() => setSelectedResult(null)}
                style={{ padding: '0.5rem 2rem', height: 'auto' }}
              >
                Close Review
              </button>
            </div>
          </div>
        </div>
      )}
    </LayoutContainer>
  );
}
