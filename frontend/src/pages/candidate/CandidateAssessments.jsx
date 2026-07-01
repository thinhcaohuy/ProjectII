import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { invitationService } from '../../services/invitationService';
import LayoutContainer from '../../components/LayoutContainer';
import { formatDate } from '../../utils/formatters';
import '../../styles/Dashboard.css';

export default function CandidateAssessments() {
  const { user } = useAuth();
  const candidateId = user?.accountId || user?.id;

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // pending, completed
  const [assessments, setAssessments] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [history, setHistory] = useState([]);

  // Active Assessment Taking States
  const [activeInv, setActiveInv] = useState(null);
  const [instructionsExam, setInstructionsExam] = useState(null);
  const [currentExam, setCurrentExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (candidateId) {
      loadData();
    }
  }, [candidateId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const candidateInvs = await invitationService.getByCandidate(candidateId);
      const submittedInvs = candidateInvs.filter(i => i.status === 'Submitted');

      setHistory(submittedInvs);
      setInvitations(candidateInvs);

      // Populate assessments only from candidate's assignments
      const mappedAssessments = candidateInvs.map(inv => ({
        examId: inv.examId,
        examName: inv.examName,
        durationMinutes: inv.durationMinutes,
        passingScore: inv.passingScore,
        questions: inv.questions || []
      }));
      setAssessments(mappedAssessments);

    } catch (err) {
      console.error('Failed to load candidate assessment data', err);
    } finally {
      setLoading(false);
    }
  };

  // Timer Tick auto-saves answers and handles auto-submission on expiration
  useEffect(() => {
    if (currentExam && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            autoSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [currentExam, timeLeft]);

  const handleStartExam = (inv) => {
    const exam = assessments.find(ex => ex.examId === inv.examId);
    if (!exam) {
      alert('Selected assessment format is not available anymore.');
      return;
    }
    setInstructionsExam({ inv, exam });
  };

  const handleConfirmStart = async () => {
    const { inv, exam } = instructionsExam;
    
    // Set invitation status to Started
    await invitationService.updateStatus(inv.id, 'Started');

    // Restore draft answers if available
    const restoredAnswers = inv.answers || {};

    setAnswers(restoredAnswers);
    setInstructionsExam(null);
    setActiveInv(inv);
    setCurrentExam(exam);
    setTimeLeft(exam.durationMinutes * 60);
  };

  const handleAnswerSelect = async (questionIndex, optionIndex) => {
    const nextAnswers = {
      ...answers,
      [questionIndex]: optionIndex
    };
    setAnswers(nextAnswers);

    // Auto-save candidate progress to invitation state
    await invitationService.saveDraftAnswers(activeInv.id, nextAnswers);
  };

  const calculateScore = () => {
    let correctCount = 0;
    const questions = currentExam.questions;
    questions.forEach((q, idx) => {
      if (answers[idx] !== undefined && answers[idx] === q.correctOptionIndex) {
        correctCount++;
      }
    });
    return parseFloat(((correctCount / questions.length) * 100).toFixed(1));
  };

  const submitExam = async () => {
    if (!confirm('Are you sure you want to submit your assessment answers now?')) return;
    await completeSubmission();
  };

  const autoSubmitExam = async () => {
    alert('Time has expired! Automatically submitting your assessment answers.');
    await completeSubmission();
  };

  const completeSubmission = async () => {
    clearInterval(timerRef.current);
    const score = calculateScore();
    const durationUsed = Math.ceil((currentExam.durationMinutes * 60 - timeLeft) / 60);

    try {
      // Update local storage invitation record
      await invitationService.updateStatus(activeInv.id, 'Submitted', {
        durationUsed,
        answers,
        submittedAt: new Date().toISOString(),
        score
      });

      alert(`Assessment submitted successfully! You scored: ${score}%`);
      setCurrentExam(null);
      setActiveInv(null);
      setAnswers({});
      loadData();
    } catch (err) {
      console.error('Error submitting exam result', err);
      alert('Network issue detected while saving scorecard. Try submitting again.');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (currentExam) {
    // Assessment Test-Taking Interface
    return (
      <div className="as-dashboard-container as-exam-container" style={{ maxWidth: '850px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <style>{`
          .timer-banner {
            position: sticky;
            top: 0;
            background: #ef4444;
            color: #fff;
            padding: 1rem;
            border-radius: 8px;
            font-weight: 800;
            font-size: 1.25rem;
            text-align: center;
            margin-bottom: 2rem;
            box-shadow: 0 4px 12px rgba(239,68,68,0.25);
            z-index: 10;
          }
          .exam-question-card {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            box-shadow: 0 2px 4px rgba(0,0,0,0.02);
          }
          .option-row {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.75rem 1rem;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            margin-top: 0.5rem;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          .option-row:hover {
            background: #f8fafc;
            border-color: #94a3b8;
          }
          .option-row.selected {
            background: #e0f2fe;
            border-color: #0ea5e9;
            font-weight: bold;
          }
        `}</style>

        <div className="timer-banner">
          Time Remaining: {formatTime(timeLeft)}
        </div>

        <section className="as-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #cbd5e1', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            <h1 style={{ margin: 0, fontSize: '1.5rem' }}>{currentExam.examName}</h1>
            <button className="as-export-btn" onClick={submitExam}>Submit Assessment</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {currentExam.questions.map((q, qIdx) => (
              <div key={qIdx} className="exam-question-card">
                <p style={{ fontWeight: 'bold', fontSize: '1.05rem', margin: '0 0 1rem 0' }}>
                  Q{qIdx + 1}: {q.questionText}
                </p>
                <div>
                  {q.options.map((opt, oIdx) => {
                    const isSelected = answers[qIdx] === oIdx;
                    return (
                      <div
                        key={oIdx}
                        onClick={() => handleAnswerSelect(qIdx, oIdx)}
                        className={`option-row ${isSelected ? 'selected' : ''}`}
                      >
                        <span style={{ minWidth: '24px', fontWeight: 'bold' }}>{String.fromCharCode(65 + oIdx)}.</span>
                        <span>{opt}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <LayoutContainer
      title="Assessments Workspace"
      subtitle="Complete recruiter evaluations and view historical scorecard assessments"
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
        .as-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
          margin-bottom: 2rem;
        }
        .as-card h2 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #111827;
          margin: 0 0 1.5rem 0;
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

        .exam-status-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-weight: 700;
          font-size: 0.8rem;
          text-transform: uppercase;
        }
        .exam-status-badge.passed { background: #d1fae5; color: #065f46; }
        .exam-status-badge.failed { background: #fee2e2; color: #991b1b; }

        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex; align-items: center; justify-content: center;
          z-index: 1000;
        }
        .modal-content {
          background: #ffffff;
          padding: 2rem;
          border-radius: 12px;
          max-width: 500px;
          width: 90%;
          box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
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
          onClick={() => setActiveTab('pending')}
          className={`as-tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
        >
          Active Tasks & Invitations
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`as-tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
        >
          Assessments History
        </button>
      </div>

      {loading ? (
        <div className="as-empty-state">Loading candidate workspace...</div>
      ) : (
        <>
          {/* PENDING TAB */}
          {activeTab === 'pending' && (
            <section className="as-card">
              <h2>Pending Dispatched Exams</h2>
              {invitations.length === 0 ? (
                <div className="as-empty-state">
                  No active assessment invitations found. Your recruiters will dispatch tests here if required.
                </div>
              ) : (
                <div className="as-table-container">
                  <table className="as-table">
                    <thead>
                      <tr>
                        <th>Assessment</th>
                        <th>Job Context</th>
                        <th>Status</th>
                        <th>Date Dispatched</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invitations.map(inv => {
                        const isSubmitted = inv.status === 'Submitted';
                        return (
                          <tr key={inv.id}>
                            <td style={{ fontWeight: 'bold' }}>{inv.examName}</td>
                            <td>{inv.jobTitle}</td>
                            <td>
                              <span className={`inv-badge ${inv.status}`}>
                                {inv.status}
                              </span>
                            </td>
                            <td>{new Date(inv.invitedAt).toLocaleDateString()}</td>
                            <td>
                              {!isSubmitted ? (
                                <button
                                  className="as-export-btn"
                                  onClick={() => handleStartExam(inv)}
                                  style={{ padding: '0.4rem 1.25rem', height: 'auto', boxShadow: 'none' }}
                                >
                                  {inv.status === 'Started' ? 'Resume Test' : 'Start Exam'}
                                </button>
                              ) : (
                                <span style={{ color: '#6b7280', fontSize: '0.9rem', fontWeight: 'bold' }}>Submitted</span>
                              )}
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

          {/* COMPLETED TAB */}
          {activeTab === 'completed' && (
            <section className="as-card">
              <h2>Performance Log</h2>
              {history.length === 0 ? (
                <div className="as-empty-state">No assessments submitted yet. Completed evaluations are recorded here.</div>
              ) : (
                <div className="as-table-container">
                  <table className="as-table">
                    <thead>
                      <tr>
                        <th>Assessment</th>
                        <th>Duration Used</th>
                        <th>Score Obtained</th>
                        <th>Status Outcome</th>
                        <th>Feedback Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map(res => {
                        const passed = res.score >= res.passingScore;
                        const durationUsed = res.startedAt && res.submittedAt 
                          ? Math.max(1, Math.round((new Date(res.submittedAt) - new Date(res.startedAt)) / 60000))
                          : 0;
                        return (
                          <tr key={res.id}>
                            <td style={{ fontWeight: 'bold' }}>{res.examName}</td>
                            <td>{durationUsed > 0 ? `${durationUsed} mins` : 'N/A'}</td>
                            <td>
                              <span style={{ fontWeight: 'bold', color: passed ? '#10b981' : '#ef4444' }}>
                                {res.score}%
                              </span>
                            </td>
                            <td>
                              <span className={`exam-status-badge ${passed ? 'passed' : 'failed'}`}>
                                {passed ? 'Passed' : 'Failed'}
                              </span>
                            </td>
                            <td>{res.feedback || 'None'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}
        </>
      )}

      {/* INSTRUCTIONS MODAL */}
      {instructionsExam && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{ borderBottom: '1px solid #cbd5e1', paddingBottom: '0.5rem' }}>Assessment Rules</h2>
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.95rem' }}>
              <p>You are about to start: <strong>{instructionsExam.exam.examName}</strong></p>
              <p>🕒 Allowed Duration: <strong>{instructionsExam.exam.durationMinutes} minutes</strong></p>
              <p>🎯 Required Score to Pass: <strong>{instructionsExam.exam.passingScore}%</strong></p>
              <p>💡 Total Question Items: <strong>{instructionsExam.exam.questions?.length || 0} questions</strong></p>
              <div style={{ padding: '0.75rem', background: '#fee2e2', borderRadius: '6px', color: '#991b1b', fontSize: '0.85rem', fontWeight: 'bold', border: '1px solid #fca5a5' }}>
                ⚠️ Do not close or refresh this page during the test. Your progress is auto-saved locally, but the timer keeps running.
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button
                onClick={() => setInstructionsExam(null)}
                style={{ background: '#cbd5e1', color: '#334155', border: 'none', borderRadius: '6px', padding: '0.5rem 1.5rem', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Cancel
              </button>
              <button
                className="as-export-btn"
                onClick={handleConfirmStart}
                style={{ padding: '0.5rem 2.5rem', height: 'auto' }}
              >
                Begin Assessment
              </button>
            </div>
          </div>
        </div>
      )}
    </LayoutContainer>
  );
}
