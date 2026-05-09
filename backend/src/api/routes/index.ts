import { Router } from 'express';
import authRoutes from './auth.routes';
import campaignRoutes from './campaign.routes';
import analyticsRoutes from './analytics.routes';
import communityRoutes from './community.routes';
import aiRoutes from './ai.routes';
import notificationRoutes from './notification.routes';
import userRoutes from './user.routes';
import automationRoutes from './automation.routes';
import workspaceRoutes from './workspace.routes';
import billingRoutes from './billing.routes';
import crmRoutes from './crm.routes';
import funnelRoutes from './funnel.routes';
import { funnelController } from '../controllers/funnel.controller';
import chatbotRoutes from './chatbot.routes';
import { chatbotController } from '../controllers/chatbot.controller';
import socialRoutes from './social.routes';
import adCreativeRoutes from './adcreative.routes';
import ecommerceRoutes from './ecommerce.routes';
import coursesRoutes from './courses.routes';
import affiliateRoutes from './affiliate.routes';
import influencerRoutes from './influencer.routes';
import biRoutes from './bi.routes';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.json({ success: true, message: 'ScaleAfrique API is running', timestamp: new Date().toISOString() });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/campaigns', campaignRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/community', communityRoutes);
router.use('/ai', aiRoutes);
router.use('/notifications', notificationRoutes);
router.use('/automations', automationRoutes);
router.use('/workspaces', workspaceRoutes);
router.use('/billing', billingRoutes);
router.use('/crm', crmRoutes);
router.use('/funnels', funnelRoutes);
router.get('/public/funnels/:slug', funnelController.getPublic);
router.post('/public/funnels/:slug/submit', funnelController.submit);
router.use('/chatbots', chatbotRoutes);
router.use('/social', socialRoutes);
router.use('/ad-creatives', adCreativeRoutes);
router.use('/ecommerce', ecommerceRoutes);
router.use('/courses', coursesRoutes);
router.use('/affiliates', affiliateRoutes);
router.use('/influencers', influencerRoutes);
router.use('/bi', biRoutes);
router.get('/public/chatbots/:id', chatbotController.getPublic);
router.post('/public/chatbots/:id/chat', chatbotController.chat);
router.post('/public/chatbots/:id/stream', chatbotController.chatStream);

export default router;
