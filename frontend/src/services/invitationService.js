import { assessmentAssignmentService } from './api';

export const invitationService = {
  // Helper to map backend Assignment to legacy Invitation format
  mapAssignmentToInvitation: (assignment) => {
    if (!assignment) return null;
    const durationUsed = assignment.startedAt && assignment.completedAt
      ? Math.max(1, Math.round((new Date(assignment.completedAt) - new Date(assignment.startedAt)) / 60000))
      : 0;
    return {
      id: assignment.assignmentId,
      candidateId: assignment.candidate ? assignment.candidate.accountId : '',
      candidateName: assignment.candidate ? assignment.candidate.fullName : 'Candidate',
      candidateEmail: assignment.candidate ? assignment.candidate.email : '',
      examId: assignment.assessment ? assignment.assessment.assessmentId : '',
      examName: assignment.assessment ? assignment.assessment.title : 'Assessment',
      jobPostId: assignment.jobPost ? assignment.jobPost.jobPostId : '',
      jobTitle: assignment.jobPost ? assignment.jobPost.title : 'Job Posting',
      employerId: (assignment.assessment && assignment.assessment.employer) ? assignment.assessment.employer.accountId : '',
      durationMinutes: assignment.assessment ? assignment.assessment.durationMinutes : 0,
      passingScore: assignment.assessment ? assignment.assessment.passingScore : 0,
      questions: assignment.assessment && assignment.assessment.questions ? assignment.assessment.questions.map(q => ({
        questionText: q.questionText,
        correctOptionIndex: q.correctOptionIndex,
        options: q.options ? [...q.options].sort((a, b) => a.optionIndex - b.optionIndex).map(o => o.optionText) : []
      })) : [],
      status: assignment.status, // Pending, Started, Submitted, Expired
      invitedAt: assignment.assignedAt,
      startedAt: assignment.startedAt,
      submittedAt: assignment.completedAt,
      durationUsed: durationUsed,
      score: assignment.score,
      feedback: assignment.feedback,
      answers: null // Loaded as needed
    };
  },

  getAll: async () => {
    // Return all (usually not called directly, but we support it)
    return [];
  },

  inviteCandidate: async (candidateId, candidateName, examId, examName, jobPostId, jobTitle, employerId) => {
    try {
      const res = await assessmentAssignmentService.assign(candidateId, examId, jobPostId);
      const invitation = invitationService.mapAssignmentToInvitation(res.data);
      window.dispatchEvent(new Event('storage'));
      return invitation;
    } catch (e) {
      console.error('Failed to invite candidate via API', e);
      throw e;
    }
  },

  getByCandidate: async (candidateId) => {
    try {
      const res = await assessmentAssignmentService.getByCandidate(candidateId);
      const list = (res.data || []).map(invitationService.mapAssignmentToInvitation);
      
      // Also check local draft answers for started ones
      for (const inv of list) {
        if (inv.status === 'Started') {
          try {
            const answersRes = await assessmentAssignmentService.getAnswers(inv.id);
            if (answersRes.data && answersRes.data.length > 0) {
              const answersMap = {};
              answersRes.data.forEach(ans => {
                answersMap[ans.orderIndex] = ans.selectedOptionIndex;
              });
              inv.answers = answersMap;
            }
          } catch (err) {
            console.error('Failed to fetch draft answers for ' + inv.id, err);
          }
        }
      }
      return list;
    } catch (e) {
      console.error('Failed to get assignments by candidate via API', e);
      return [];
    }
  },

  getByEmployer: async (employerId) => {
    try {
      const res = await assessmentAssignmentService.getByEmployer(employerId);
      return (res.data || []).map(invitationService.mapAssignmentToInvitation);
    } catch (e) {
      console.error('Failed to get assignments by employer via API', e);
      return [];
    }
  },

  getByExam: async (examId) => {
    // Standard filter
    return [];
  },

  updateStatus: async (invitationId, status, extraData = {}) => {
    try {
      if (status === 'Started') {
        const res = await assessmentAssignmentService.start(invitationId);
        window.dispatchEvent(new Event('storage'));
        return invitationService.mapAssignmentToInvitation(res.data);
      } else if (status === 'Submitted') {
        const durationUsed = extraData.durationUsed || 0;
        const answers = extraData.answers || {};
        const res = await assessmentAssignmentService.submit(invitationId, answers, durationUsed);
        window.dispatchEvent(new Event('storage'));
        return invitationService.mapAssignmentToInvitation(res.data);
      }
      return null;
    } catch (e) {
      console.error('Failed to update status via API', e);
      return null;
    }
  },

  saveDraftAnswers: async (invitationId, answers) => {
    try {
      await assessmentAssignmentService.saveDraft(invitationId, answers);
      return true;
    } catch (e) {
      console.error('Failed to save draft answers via API', e);
      return false;
    }
  }
};
