import axios from 'axios';

// Backend base URL - API calls ke liye proxy use hoga
const api = axios.create({
  baseURL: '',
  headers: { 'Content-Type': 'application/json' },
});

// ✅ BACKEND URL - file links ke liye direct backend use karo
// React proxy HTML requests forward nahi karta (Accept: text/html issue)
// Isliye files ka direct link banana zaroori hai
export const BACKEND_URL = 'http://localhost:8080';

// File URL builder - ALWAYS returns full absolute URL pointing to backend
export const getFileUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  // Remove leading slash if present, then prepend backend URL
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${BACKEND_URL}/${cleanPath}`;
};

// JWT token har request ke saath
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 401 pe logout
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  login:           data => api.post('/api/auth/login', data),
  registerStudent: data => api.post('/api/auth/register/student', data),
  registerCompany: data => api.post('/api/auth/register/company', data),
};

export const studentAPI = {
  getProfile:      ()       => api.get('/api/student/profile'),
  updateProfile:   data     => api.put('/api/student/profile', data),
  addSkill:        skillId  => api.post(`/api/student/skills/${skillId}`),
  removeSkill:     skillId  => api.delete(`/api/student/skills/${skillId}`),
  uploadResume:    formData => api.post('/api/student/resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  uploadPhoto:     formData => api.post('/api/student/photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getApplications: ()       => api.get('/api/student/applications'),
  suggestSkills:   q        => api.get(`/api/student/skills/suggest?q=${q}`),
};

export const jobAPI = {
  getJobs:     ()   => api.get('/api/jobs'),
  getJob:      id   => api.get(`/api/jobs/${id}`),
  getSkills:   q    => api.get(`/api/skills${q ? '?q=' + q : ''}`),
  applyForJob: data => api.post('/api/apply', data),
};

export const companyAPI = {
  getProfile:    ()       => api.get('/api/company/profile'),
  updateProfile: data     => api.put('/api/company/profile', data),
  uploadCert:    formData => api.post('/api/company/upload-certificate', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  uploadLogo:    formData => api.post('/api/company/upload-logo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  postJob:       data     => api.post('/api/company/post-job', data),
  getJobs:       ()       => api.get('/api/company/jobs'),
  closeJob:      id       => api.put(`/api/company/jobs/${id}/close`),
  getApplicants: jobId    => api.get(`/api/company/applicants/${jobId}`),
  updateStatus:  (appId, status, feedback) =>
    api.put(`/api/company/application/${appId}/status`, null, { params: { status, feedback } }),
};

export const adminAPI = {
  getDashboard:    ()           => api.get('/api/admin/dashboard'),
  getStudents:     ()           => api.get('/api/admin/students'),
  getCompanies:    ()           => api.get('/api/admin/companies'),
  getPending:      ()           => api.get('/api/admin/companies/pending'),
  approveCompany:  id           => api.put(`/api/admin/approve-company/${id}`),
  rejectCompany:   (id, reason) => api.put(`/api/admin/reject-company/${id}`, null, { params: { reason } }),
  getApplications: ()           => api.get('/api/admin/applications'),
  getReports:      ()           => api.get('/api/admin/reports'),
};

export default api;
