import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Auth Service
export const authService = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  registerEmployer: (email, password, companyName, address, avatarUrl, companySize, website, description) =>
    api.post('/auth/register/employer', {
      email,
      password,
      companyName,
      address,
      avatarUrl,
      companySize,
      website,
      description
    }),
  registerCandidate: (email, password, fullName, phoneNumber, address, avatarUrl) =>
    api.post('/auth/register/candidate', {
      email,
      password,
      fullName,
      phoneNumber,
      address,
      avatarUrl
    })
};

// Job Post Service
export const jobPostService = {
  create: (employerId, job) => api.post(`/job-posts/${employerId}`, job),
  getById: (id) => api.get(`/job-posts/${id}`),
  getAll: () => api.get('/job-posts'),
  getByEmployer: (employerId) => api.get(`/job-posts/employer/${employerId}`),
  search: (keyword) => api.get('/job-posts/search', { params: { keyword } }),
  searchAdvanced: (filters) => api.get('/job-posts/search-advanced', { params: filters }),
  update: (id, job) => api.put(`/job-posts/${id}`, job),
  close: (id) => api.put(`/job-posts/${id}/close`),
  delete: (id) => api.delete(`/job-posts/${id}`)
};

// Job Application Service
export const jobApplicationService = {
  submit: (candidateId, jobPostId, coverLetter) =>
    api.post(`/job-applications/${candidateId}/${jobPostId}`, {}, { params: { coverLetter } }),
  getById: (id) => api.get(`/job-applications/${id}`),
  getByJob: (jobPostId, requesterId) => api.get(`/job-applications/job/${jobPostId}`, { params: { requesterId } }),
  getByCandidate: (candidateId) => api.get(`/job-applications/candidate/${candidateId}`),
  updateStatus: (id, status, requesterId) => api.put(`/job-applications/${id}/status`, {}, { params: { status, requesterId } }),
  getByStatus: (status) => api.get(`/job-applications/status/${status}`)
};

// Exam Service
export const examService = {
  create: (exam) => api.post('/exams', exam),
  getById: (id) => api.get(`/exams/${id}`),
  getAll: () => api.get('/exams'),
  getByEmployer: (employerId) => api.get(`/exams/employer/${employerId}`),
  update: (id, exam) => api.put(`/exams/${id}`, exam),
  delete: (id) => api.delete(`/exams/${id}`)
};

// Assessment Assignment Service
export const assessmentAssignmentService = {
  assign: (candidateId, assessmentId, jobPostId) =>
    api.post('/assessment-assignments', { candidateId, assessmentId, jobPostId }),
  getByCandidate: (candidateId) =>
    api.get(`/assessment-assignments/candidate/${candidateId}`),
  getByEmployer: (employerId) =>
    api.get(`/assessment-assignments/employer/${employerId}`),
  start: (assignmentId) =>
    api.post(`/assessment-assignments/${assignmentId}/start`),
  saveDraft: (assignmentId, answers) =>
    api.post(`/assessment-assignments/${assignmentId}/save-draft`, answers),
  submit: (assignmentId, answers, durationMinutes) =>
    api.post(`/assessment-assignments/${assignmentId}/submit`, { answers, durationMinutes }),
  getAnswers: (assignmentId) =>
    api.get(`/assessment-assignments/${assignmentId}/answers`)
};

// Candidate Service
export const candidateService = {
  getById: (id) => api.get(`/candidates/${id}`),
  getAll: () => api.get('/candidates'),
  update: (id, candidate) => api.put(`/candidates/${id}`, candidate),
  delete: (id) => api.delete(`/candidates/${id}`)
};

// Employer Service
export const employerService = {
  getById: (id) => api.get(`/employers/${id}`),
  getAll: () => api.get('/employers'),
  update: (id, employer) => api.put(`/employers/${id}`, employer),
  delete: (id) => api.delete(`/employers/${id}`)
};

// ========== Profile Sections ==========

// Education Service
export const educationService = {
  create: (education) => api.post('/education', education),
  getById: (accountId, educationId) => api.get(`/education/${accountId}/${educationId}`),
  getByAccount: (accountId) => api.get(`/education/account/${accountId}`),
  update: (accountId, educationId, education) => api.put(`/education/${accountId}/${educationId}`, education),
  delete: (accountId, educationId) => api.delete(`/education/${accountId}/${educationId}`)
};

// Experience Service
export const experienceService = {
  create: (experience) => api.post('/experience', experience),
  getById: (accountId, experienceId) => api.get(`/experience/${accountId}/${experienceId}`),
  getByAccount: (accountId) => api.get(`/experience/account/${accountId}`),
  update: (accountId, experienceId, experience) => api.put(`/experience/${accountId}/${experienceId}`, experience),
  delete: (accountId, experienceId) => api.delete(`/experience/${accountId}/${experienceId}`)
};

// Skill Service
export const skillService = {
  create: (skill) => api.post('/skill', skill),
  getById: (accountId, skillId) => api.get(`/skill/${accountId}/${skillId}`),
  getByAccount: (accountId) => api.get(`/skill/account/${accountId}`),
  update: (accountId, skillId, skill) => api.put(`/skill/${accountId}/${skillId}`, skill),
  delete: (accountId, skillId) => api.delete(`/skill/${accountId}/${skillId}`)
};

// Project Service
export const projectService = {
  create: (project) => api.post('/project', project),
  getById: (accountId, projectId) => api.get(`/project/${accountId}/${projectId}`),
  getByAccount: (accountId) => api.get(`/project/account/${accountId}`),
  update: (accountId, projectId, project) => api.put(`/project/${accountId}/${projectId}`, project),
  delete: (accountId, projectId) => api.delete(`/project/${accountId}/${projectId}`)
};

export default api;
