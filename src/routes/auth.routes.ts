import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { loginValidation, validateRequest } from '../middleware/validation';

const router = Router();
const authController = new AuthController();

// Authentication routes
router.post(
  '/login',
  loginValidation,
  validateRequest,
  authController.login
);

router.get(
  '/profile',
  authController.getProfile
);

export default router;