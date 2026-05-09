import { prisma } from '../../config/database';

export const coursesService = {
  async list(workspaceId: string) {
    return prisma.course.findMany({
      where: { workspaceId },
      include: {
        _count: { select: { lessons: true, enrollments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async get(id: string, workspaceId: string) {
    return prisma.course.findFirst({
      where: { id, workspaceId },
      include: {
        lessons: { orderBy: { order: 'asc' } },
        _count: { select: { enrollments: true } },
      },
    });
  },

  async create(workspaceId: string, data: { title: string; description?: string; price?: number; category?: string; thumbnail?: string }) {
    return prisma.course.create({ data: { workspaceId, ...data } });
  },

  async update(id: string, workspaceId: string, data: Partial<{ title: string; description: string; price: number; category: string; thumbnail: string; isPublished: boolean }>) {
    return prisma.course.update({ where: { id, workspaceId }, data });
  },

  async delete(id: string, workspaceId: string) {
    return prisma.course.delete({ where: { id, workspaceId } });
  },

  async addLesson(courseId: string, workspaceId: string, data: { title: string; content?: string; videoUrl?: string; duration?: number }) {
    const course = await prisma.course.findFirst({ where: { id: courseId, workspaceId } });
    if (!course) throw new Error('Not found');
    const count = await prisma.lesson.count({ where: { courseId } });
    return prisma.lesson.create({ data: { courseId, order: count, ...data } });
  },

  async updateLesson(lessonId: string, courseId: string, workspaceId: string, data: Partial<{ title: string; content: string; videoUrl: string; duration: number; order: number }>) {
    const course = await prisma.course.findFirst({ where: { id: courseId, workspaceId } });
    if (!course) throw new Error('Not found');
    return prisma.lesson.update({ where: { id: lessonId }, data });
  },

  async deleteLesson(lessonId: string, courseId: string, workspaceId: string) {
    const course = await prisma.course.findFirst({ where: { id: courseId, workspaceId } });
    if (!course) throw new Error('Not found');
    return prisma.lesson.delete({ where: { id: lessonId } });
  },

  async enroll(courseId: string, userId: string) {
    return prisma.enrollment.upsert({
      where: { courseId_userId: { courseId, userId } },
      create: { courseId, userId },
      update: {},
    });
  },

  async getEnrollments(courseId: string, workspaceId: string) {
    const course = await prisma.course.findFirst({ where: { id: courseId, workspaceId } });
    if (!course) throw new Error('Not found');
    return prisma.enrollment.findMany({ where: { courseId }, orderBy: { createdAt: 'desc' } });
  },
};
