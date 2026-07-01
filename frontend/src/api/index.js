import axiosClient from './axiosClient';

export const authApi = {
  login: (email, password) =>
    axiosClient.post('/auth/login', { email, password }),
  registerEmployer: (data) =>
    axiosClient.post('/auth/register/employer', data),
  registerCandidate: (data) =>
    axiosClient.post('/auth/register/candidate', data)
};

export const jobPostApi = {
  create: (employerId, job) => axiosClient.post(`/job-posts/${employerId}`, job),
  getById: (id) => axiosClient.get(`/job-posts/${id}`),
  getAll: () => axiosClient.get('/job-posts'),
  getByEmployer: (employerId) => axiosClient.get(`/job-posts/employer/${employerId}`),
  search: (keyword) => axiosClient.get('/job-posts/search', { params: { keyword } }),
  searchAdvanced: (filters) => axiosClient.get('/job-posts/search-advanced', { params: filters }),
  update: (id, job) => axiosClient.put(`/job-posts/${id}`, job),
  close: (id) => axiosClient.put(`/job-posts/${id}/close`),
  delete: (id) => axiosClient.delete(`/job-posts/${id}`)
};

export const jobApplicationApi = {
  submit: (candidateId, jobPostId, coverLetter) =>
    axiosClient.post(`/job-applications/${candidateId}/${jobPostId}`, {}, { params: { coverLetter } }),
  getById: (id) => axiosClient.get(`/job-applications/${id}`),
  getByJob: (jobPostId, requesterId) => axiosClient.get(`/job-applications/job/${jobPostId}`, { params: { requesterId } }),
  getByCandidate: (candidateId) => axiosClient.get(`/job-applications/candidate/${candidateId}`),
  updateStatus: (id, status, requesterId) => axiosClient.put(`/job-applications/${id}/status`, {}, { params: { status, requesterId } }),
  getByStatus: (status) => axiosClient.get(`/job-applications/status/${status}`)
};

export const examApi = {
  create: (exam) => axiosClient.post('/exams', exam),
  getById: (id) => axiosClient.get(`/exams/${id}`),
  getAll: () => axiosClient.get('/exams'),
  getByEmployer: (employerId) => axiosClient.get(`/exams/employer/${employerId}`),
  update: (id, exam) => axiosClient.put(`/exams/${id}`, exam),
  delete: (id) => axiosClient.delete(`/exams/${id}`)
};

export const examResultApi = {
  submit: (candidateId, examId, params) =>
    axiosClient.post(`/exam-results/${candidateId}/${examId}`, {}, { params }),
  getById: (id) => axiosClient.get(`/exam-results/${id}`),
  getByCandidate: (candidateId) => axiosClient.get(`/exam-results/candidate/${candidateId}`),
  getByExam: (examId) => axiosClient.get(`/exam-results/exam/${examId}`),
  checkPassed: (id) => axiosClient.get(`/exam-results/${id}/passed`)
};

export const profileApi = {
  // Education
  getEducation: (accountId) => axiosClient.get(`/education/account/${accountId}`),
  createEducation: (data) => axiosClient.post('/education', data),
  updateEducation: (accountId, id, data) => axiosClient.put(`/education/${accountId}/${id}`, data),
  deleteEducation: (accountId, id) => axiosClient.delete(`/education/${accountId}/${id}`),
  
  // Experience
  getExperience: (accountId) => axiosClient.get(`/experience/account/${accountId}`),
  createExperience: (data) => axiosClient.post('/experience', data),
  updateExperience: (accountId, id, data) => axiosClient.put(`/experience/${accountId}/${id}`, data),
  deleteExperience: (accountId, id) => axiosClient.delete(`/experience/${accountId}/${id}`),
  
  // Skill
  getSkills: (accountId) => axiosClient.get(`/skill/account/${accountId}`),
  createSkill: (data) => axiosClient.post('/skill', data),
  updateSkill: (accountId, id, data) => axiosClient.put(`/skill/${accountId}/${id}`, data),
  deleteSkill: (accountId, id) => axiosClient.delete(`/skill/${accountId}/${id}`),
  
  // Project
  getProjects: (accountId) => axiosClient.get(`/project/account/${accountId}`),
  createProject: (data) => axiosClient.post('/project', data),
  updateProject: (accountId, id, data) => axiosClient.put(`/project/${accountId}/${id}`, data),
  deleteProject: (accountId, id) => axiosClient.delete(`/project/${accountId}/${id}`)
};