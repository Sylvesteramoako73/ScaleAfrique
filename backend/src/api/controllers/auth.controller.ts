import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../../config/database';
import { redisHelpers } from '../../config/redis';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt';
import { generateSecureToken, hashToken } from '../../utils/encryption';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../../utils/validators';
import { AppError } from '../middleware/errorHandler';
import { emailService } from '../../services/email/email.service';

const REFRESH_TOKEN_TTL = 30 * 24 * 60 * 60; // 30 days in seconds

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = registerSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new AppError('Email already registered', 409);

    const hashedPassword = await bcrypt.hash(data.password, 12);
    const verifyToken = generateSecureToken(32);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        verifyToken: hashToken(verifyToken),
      },
      select: { id: true, email: true, name: true, role: true },
    });

    // Send verification email (non-blocking)
    emailService.sendVerificationEmail(user.email, user.name, verifyToken).catch(() => null);

    const accessToken = signAccessToken({ userId: user.id, email: user.email, role: user.role });
    const refreshToken = signRefreshToken({ userId: user.id });

    await redisHelpers.setex(`refresh:${user.id}`, REFRESH_TOKEN_TTL, hashToken(refreshToken));

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify your email.',
      data: { user, accessToken, refreshToken },
    });
  } catch (err) { next(err); }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: data.email },
      select: { id: true, email: true, name: true, role: true, password: true, isVerified: true, avatar: true },
    });

    if (!user || !user.password) throw new AppError('Invalid email or password', 401);

    const passwordValid = await bcrypt.compare(data.password, user.password);
    if (!passwordValid) throw new AppError('Invalid email or password', 401);

    // Update last login timestamp
    await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });

    const accessToken = signAccessToken({ userId: user.id, email: user.email, role: user.role });
    const refreshToken = signRefreshToken({ userId: user.id });

    await redisHelpers.setex(`refresh:${user.id}`, REFRESH_TOKEN_TTL, hashToken(refreshToken));

    const { password: _pw, ...safeUser } = user;
    res.json({
      success: true,
      data: { user: safeUser, accessToken, refreshToken },
    });
  } catch (err) { next(err); }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await redisHelpers.del(`refresh:${req.user!.id}`);
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) { next(err); }
}

export async function refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { refreshToken: token } = req.body as { refreshToken?: string };
    if (!token) throw new AppError('Refresh token required', 400);

    const decoded = verifyRefreshToken(token);
    const stored = await redisHelpers.get(`refresh:${decoded.userId}`);
    if (!stored || stored !== hashToken(token)) {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true },
    });
    if (!user) throw new AppError('User not found', 404);

    const accessToken = signAccessToken({ userId: user.id, email: user.email, role: user.role });
    const newRefreshToken = signRefreshToken({ userId: user.id });

    await redisHelpers.setex(`refresh:${user.id}`, REFRESH_TOKEN_TTL, hashToken(newRefreshToken));

    res.json({ success: true, data: { accessToken, refreshToken: newRefreshToken } });
  } catch (err) { next(err); }
}

export async function forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true, name: true, email: true } });

    // Always respond with success to prevent user enumeration
    if (user) {
      const resetToken = generateSecureToken(32);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await prisma.user.update({
        where: { id: user.id },
        data: { resetToken: hashToken(resetToken), resetTokenExpiry: expiresAt },
      });

      emailService.sendPasswordResetEmail(user.email, user.name, resetToken).catch(() => null);
    }

    res.json({ success: true, message: 'If that email is registered, a reset link has been sent.' });
  } catch (err) { next(err); }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { token, password } = resetPasswordSchema.parse(req.body);

    const user = await prisma.user.findFirst({
      where: {
        resetToken: hashToken(token),
        resetTokenExpiry: { gt: new Date() },
      },
    });
    if (!user) throw new AppError('Invalid or expired reset token', 400);

    const hashedPassword = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, resetToken: null, resetTokenExpiry: null },
    });

    // Invalidate existing sessions
    await redisHelpers.del(`refresh:${user.id}`);

    res.json({ success: true, message: 'Password reset successful. Please log in.' });
  } catch (err) { next(err); }
}

export async function changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { currentPassword, newPassword } = req.body as { currentPassword?: string; newPassword?: string };
    if (!currentPassword || !newPassword) throw new AppError('Current and new password are required', 400);
    if (newPassword.length < 8) throw new AppError('New password must be at least 8 characters', 400);

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, password: true },
    });
    if (!user || !user.password) throw new AppError('User not found', 404);

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) throw new AppError('Current password is incorrect', 400);

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });

    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err) { next(err); }
}

export async function verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { token } = req.params;
    const user = await prisma.user.findFirst({ where: { verifyToken: hashToken(token) } });
    if (!user) throw new AppError('Invalid verification token', 400);

    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true, verifyToken: null },
    });

    res.json({ success: true, message: 'Email verified successfully.' });
  } catch (err) { next(err); }
}
