"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const agent_controller_1 = require("../controllers/agent.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const agentController = new agent_controller_1.AgentController();
// Agent CRUD operations
router.post('/', auth_1.authenticate, (0, auth_1.authorize)(['admin']), agentController.createAgent);
router.get('/', auth_1.authenticate, agentController.getAllAgents);
router.get('/:id', auth_1.authenticate, agentController.getAgent);
router.put('/:id', auth_1.authenticate, (0, auth_1.authorize)(['admin']), agentController.updateAgent);
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)(['admin']), agentController.deleteAgent);
// Agent filtering
router.get('/capability/:capability', auth_1.authenticate, agentController.getAgentsByCapability);
router.get('/status/:status', auth_1.authenticate, agentController.getAgentsByStatus);
exports.default = router;
//# sourceMappingURL=agent.routes.js.map