import { Router } from 'express';
import {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  likePost,
  getComments,
  createComment,
  getEvents,
  createEvent,
  getResources,
  createResource,
} from '../controllers/community.controller';
import { requireAuth } from '../middleware/auth';
import { optionalAuth } from '../middleware/auth';

const router = Router();

// Public read routes
router.get('/posts', optionalAuth, getPosts);
router.get('/posts/:id', optionalAuth, getPost);
router.get('/posts/:id/comments', getComments);
router.get('/events', optionalAuth, getEvents);
router.get('/resources', optionalAuth, getResources);

// Authenticated routes
router.post('/posts', requireAuth, createPost);
router.put('/posts/:id', requireAuth, updatePost);
router.delete('/posts/:id', requireAuth, deletePost);
router.post('/posts/:id/like', requireAuth, likePost);
router.post('/posts/:id/comments', requireAuth, createComment);
router.post('/events', requireAuth, createEvent);
router.post('/resources', requireAuth, createResource);

export default router;
