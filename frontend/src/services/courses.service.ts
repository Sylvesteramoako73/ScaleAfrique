import { api } from './api';
export interface Lesson { id: string; courseId: string; title: string; content?: string; videoUrl?: string; order: number; duration?: number; }
export interface Course { id: string; title: string; description?: string; thumbnail?: string; price: number; category?: string; isPublished: boolean; lessons?: Lesson[]; _count?: { lessons: number; enrollments: number }; createdAt: string; }
export const coursesService = {
  async list() { return (await api.get('/courses')).data.data as Course[]; },
  async get(id: string) { return (await api.get(`/courses/${id}`)).data.data as Course; },
  async create(data: { title: string; description?: string; price?: number; category?: string }) { return (await api.post('/courses', data)).data.data as Course; },
  async update(id: string, data: Partial<Course>) { return (await api.put(`/courses/${id}`, data)).data.data as Course; },
  async delete(id: string) { await api.delete(`/courses/${id}`); },
  async addLesson(courseId: string, data: { title: string; content?: string; videoUrl?: string; duration?: number }) { return (await api.post(`/courses/${courseId}/lessons`, data)).data.data as Lesson; },
  async updateLesson(courseId: string, lessonId: string, data: Partial<Lesson>) { return (await api.put(`/courses/${courseId}/lessons/${lessonId}`, data)).data.data as Lesson; },
  async deleteLesson(courseId: string, lessonId: string) { await api.delete(`/courses/${courseId}/lessons/${lessonId}`); },
};
