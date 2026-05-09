import { Router } from 'express';
import {
  getCRMDashboard,
  listContacts, getContact, createContact, updateContact, deleteContact,
  listLeads, createLead, updateLead,
  listPipelines, createPipeline,
  listDeals, createDeal, updateDeal, deleteDeal,
  createActivity,
} from '../controllers/crm.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.use(requireAuth);
router.get('/dashboard', getCRMDashboard);
router.get('/contacts', listContacts);
router.post('/contacts', createContact);
router.get('/contacts/:id', getContact);
router.put('/contacts/:id', updateContact);
router.delete('/contacts/:id', deleteContact);
router.get('/leads', listLeads);
router.post('/leads', createLead);
router.put('/leads/:id', updateLead);
router.get('/pipelines', listPipelines);
router.post('/pipelines', createPipeline);
router.get('/deals', listDeals);
router.post('/deals', createDeal);
router.put('/deals/:id', updateDeal);
router.delete('/deals/:id', deleteDeal);
router.post('/activities', createActivity);

export default router;
