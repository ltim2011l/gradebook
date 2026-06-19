import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

export const authAPI = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

export const scheduleAPI = {
  getMy: () => api.get('/schedule/my'),
};

export const journalAPI = {
  getBySchedule: (scheduleId: string) => api.get(`/journal/${scheduleId}`),
  markAttendance: (data: { scheduleId: string; studentId: string; status: string }) =>
    api.post('/journal/attendance', data),
  addGrade: (data: { scheduleId: string; studentId: string; value: number; comment?: string }) =>
    api.post('/journal/grade', data),
  addDay: (data: { date: string; startTime: string; endTime: string; room: string; subjectId: string; groupId: string }) =>
    api.post('/journal/add-day', data),
};

export const subjectsAPI = {
  getAll: () => api.get('/subjects'),
  getById: (id: string) => api.get(`/subjects/${id}`),
  createTemplate: (data: any) => api.post('/subjects/template', data),
};

export const labsAPI = {
  submit: (templateId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/labs/${templateId}/submit`, formData);
  },
  getSubmissions: (templateId: string) => api.get(`/labs/template/${templateId}/submissions`),
  review: (submissionId: string, data: { score: number; comment: string }) =>
    api.post(`/labs/submission/${submissionId}/review`, data),
};

export default api;