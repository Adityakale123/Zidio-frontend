import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 403 || error.response?.status === 401) {
            console.error('Authentication error - token may be invalid');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const auth = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
};

export const student = {
    getProfile: (userId) => api.get(`/student/profile/${userId}`),
    updateProfile: (userId, data) => api.put(`/student/profile/${userId}`, data),
    uploadResume: (userId, file) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post(`/student/resume/${userId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
    applyToJob: (studentId, jobId, coverLetter) =>
        api.post(`/student/apply?studentId=${studentId}&jobId=${jobId}&coverLetter=${coverLetter}`),
    getApplications: (studentId) => api.get(`/student/applications/${studentId}`),
    toggleBookmark: (studentId, jobId) =>
        api.post(`/student/bookmark?studentId=${studentId}&jobId=${jobId}`),
    getBookmarks: (studentId) => api.get(`/student/bookmarks/${studentId}`),
    getJobDetails: (jobId) => api.get(`/jobs/public/${jobId}`),
};

export const recruiter = {
    getProfile: (userId) => api.get(`/recruiter/profile/${userId}`),
    updateProfile: (userId, data) => api.put(`/recruiter/profile/${userId}`, data),
    createJob: (recruiterId, data) => api.post(`/recruiter/jobs/${recruiterId}`, data),
    getMyJobs: (recruiterId) => api.get(`/recruiter/jobs/${recruiterId}`),
    updateJob: (recruiterId, jobId, data) => api.put(`/recruiter/jobs/${recruiterId}/${jobId}`, data),
    deleteJob: (recruiterId, jobId) => api.delete(`/recruiter/jobs/${recruiterId}/${jobId}`),
    getApplications: (recruiterId, jobId) => api.get(`/recruiter/applications/${recruiterId}/${jobId}`),
    updateApplicationStatus: (recruiterId, applicationId, status) =>
        api.put(`/recruiter/application/${recruiterId}/${applicationId}?status=${status}`),
};

export const jobs = {
    getAll: () => api.get('/jobs/public/all'),
    getById: (id) => api.get(`/jobs/public/${id}`),
    search: (params) => api.get('/jobs/public/search', { params }),
};

export const admin = {
    getAllUsers: () => api.get('/admin/users'),
    getPendingUsers: () => api.get('/admin/users/pending'),
    approveUser: (userId) => api.put(`/admin/users/${userId}/approve`),
    blockUser: (userId) => api.put(`/admin/users/${userId}/block`),
    deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
    getAnalytics: () => api.get('/admin/analytics'),
};

export default api;