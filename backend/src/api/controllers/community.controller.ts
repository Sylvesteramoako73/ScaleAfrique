import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/database';
import { communityPostSchema, commentSchema } from '../../utils/validators';
import { AppError } from '../middleware/errorHandler';
import { z } from 'zod';

const eventSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10),
  type: z.enum(['WEBINAR', 'WORKSHOP', 'NETWORKING']),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  location: z.string().optional(),
  maxAttendees: z.number().int().positive().optional(),
  isOnline: z.boolean().default(false),
  meetingLink: z.string().url().optional().or(z.literal('')),
  tags: z.array(z.string()).optional(),
});


export async function getPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { category, tag, page = '1', limit = '20' } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      isPublished: true,
      ...(category ? { category } : {}),
      ...(tag ? { tags: { has: tag } } : {}),
    };

    const [posts, total] = await Promise.all([
      prisma.communityPost.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, avatar: true, startupProfile: { select: { companyName: true, country: true } } } },
          _count: { select: { comments: true } },
        },
      }),
      prisma.communityPost.count({ where }),
    ]);

    res.json({ success: true, data: { posts, total, page: parseInt(page), limit: parseInt(limit) } });
  } catch (err) { next(err); }
}

export async function getPost(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const post = await prisma.communityPost.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { id: true, name: true, avatar: true, startupProfile: { select: { companyName: true, country: true } } } },
        comments: {
          include: { user: { select: { id: true, name: true, avatar: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!post || !post.isPublished) throw new AppError('Post not found', 404);
    await prisma.communityPost.update({ where: { id: post.id }, data: { views: { increment: 1 } } });
    res.json({ success: true, data: post });
  } catch (err) { next(err); }
}

export async function createPost(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = communityPostSchema.parse(req.body);
    const post = await prisma.communityPost.create({
      data: { ...data, userId: req.user!.id, tags: data.tags ?? [] },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    });
    res.status(201).json({ success: true, data: post });
  } catch (err) { next(err); }
}

export async function updatePost(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const existing = await prisma.communityPost.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.userId !== req.user!.id) throw new AppError('Post not found or access denied', 403);
    const raw = communityPostSchema.partial().parse(req.body);
    const updateData: { title?: string; content?: string; category?: string; tags?: string[] } = {
      ...(raw.title ? { title: raw.title } : {}),
      ...(raw.content ? { content: raw.content } : {}),
      ...(raw.category ? { category: raw.category } : {}),
      ...(raw.tags ? { tags: raw.tags } : {}),
    };
    const post = await prisma.communityPost.update({ where: { id: req.params.id }, data: updateData });
    res.json({ success: true, data: post });
  } catch (err) { next(err); }
}

export async function deletePost(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const existing = await prisma.communityPost.findUnique({ where: { id: req.params.id } });
    if (!existing || (existing.userId !== req.user!.id && req.user!.role !== 'ADMIN')) {
      throw new AppError('Post not found or access denied', 403);
    }
    await prisma.communityPost.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Post deleted' });
  } catch (err) { next(err); }
}

export async function likePost(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const post = await prisma.communityPost.update({
      where: { id: req.params.id },
      data: { likes: { increment: 1 } },
    });
    res.json({ success: true, data: { likes: post.likes } });
  } catch (err) { next(err); }
}

export async function getComments(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const comments = await prisma.comment.findMany({
      where: { postId: req.params.id },
      include: { user: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: 'asc' },
    });
    res.json({ success: true, data: comments });
  } catch (err) { next(err); }
}

export async function createComment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { content } = commentSchema.parse(req.body);
    const comment = await prisma.comment.create({
      data: { postId: req.params.id, userId: req.user!.id, content },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    });
    res.status(201).json({ success: true, data: comment });
  } catch (err) { next(err); }
}

export async function getEvents(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { type, upcoming = 'true' } = req.query as Record<string, string>;
    const where = {
      ...(type ? { type } : {}),
      ...(upcoming === 'true' ? { startDate: { gte: new Date() } } : {}),
    };
    const events = await prisma.event.findMany({
      where,
      orderBy: { startDate: 'asc' },
      include: { organizer: { select: { id: true, name: true, avatar: true } } },
    });
    res.json({ success: true, data: events });
  } catch (err) { next(err); }
}

export async function createEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = eventSchema.parse(req.body);
    const event = await prisma.event.create({
      data: {
        ...data,
        organizerId: req.user!.id,
        tags: data.tags ?? [],
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
      },
      include: { organizer: { select: { id: true, name: true } } },
    });
    res.status(201).json({ success: true, data: event });
  } catch (err) { next(err); }
}

export async function getResources(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { type, tag } = req.query as Record<string, string>;
    const resources = await prisma.resource.findMany({
      where: {
        isPublic: true,
        ...(type ? { type } : {}),
        ...(tag ? { tags: { has: tag } } : {}),
      },
      orderBy: { downloads: 'desc' },
      include: { user: { select: { id: true, name: true } } },
    });
    res.json({ success: true, data: resources });
  } catch (err) { next(err); }
}

export async function createResource(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schema = z.object({
      title: z.string().min(3),
      description: z.string().min(10),
      type: z.enum(['GUIDE', 'TEMPLATE', 'TOOL', 'CASE_STUDY']),
      fileUrl: z.string().url().optional(),
      tags: z.array(z.string()).optional(),
      isPublic: z.boolean().optional(),
    });
    const data = schema.parse(req.body);
    const resource = await prisma.resource.create({
      data: { ...data, userId: req.user!.id, tags: data.tags ?? [] },
    });
    res.status(201).json({ success: true, data: resource });
  } catch (err) { next(err); }
}
