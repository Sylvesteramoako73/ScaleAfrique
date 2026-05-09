import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { prisma } from '../../config/database';
import { AppError } from '../middleware/errorHandler';
import { onboardingSchema } from '../../utils/validators';

const router = Router();

// Get current user
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true, email: true, name: true, role: true, avatar: true,
        isVerified: true, createdAt: true, startupProfile: true,
      },
    });
    if (!user) throw new AppError('User not found', 404);
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
});

// Update current user
router.put('/me', requireAuth, async (req, res, next) => {
  try {
    const { name, avatar } = req.body as { name?: string; avatar?: string };
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { name, avatar },
      select: { id: true, email: true, name: true, avatar: true },
    });
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
});

// Upsert startup profile (onboarding) — both paths work
async function upsertProfile(req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) {
  try {
    const raw = onboardingSchema.parse(req.body);
    const data = { ...raw, languages: raw.languages ?? [] };
    const profile = await prisma.startupProfile.upsert({
      where: { userId: req.user!.id },
      update: data,
      create: { userId: req.user!.id, ...data },
    });
    res.json({ success: true, data: { startupProfile: profile } });
  } catch (err) { next(err); }
}

router.post('/me/startup-profile', requireAuth, upsertProfile);
router.post('/onboarding', requireAuth, upsertProfile);

export default router;
