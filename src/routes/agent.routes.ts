import { Router } from 'express';
import { AgentController } from '../controllers/agent.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = Router();
const agentController = new AgentController();

// Agent CRUD operations
router.post(
  '/',
  authenticate,
  authorize(['admin']),
  agentController.createAgent
);

router.get(
  '/',
  authenticate,
  agentController.getAllAgents
);

router.get(
  '/:id',
  authenticate,
  agentController.getAgent
);

router.put(
  '/:id',
  authenticate,
  authorize(['admin']),
  agentController.updateAgent
);

router.delete(
  '/:id',
  authenticate,
  authorize(['admin']),
  agentController.deleteAgent
);

// Agent filtering
router.get(
  '/capability/:capability',
  authenticate,
  agentController.getAgentsByCapability
);

router.get(
  '/status/:status',
  authenticate,
  agentController.getAgentsByStatus
);

export default router;