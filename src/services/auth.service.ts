import { UserModel } from '../models/user.model';
import { LoginRequest, LoginResponse } from '../types';
import { generateToken } from '../utils/jwt';
import { logger } from '../utils/logger';

export class AuthService {
  private userModel: UserModel;

  constructor() {
    this.userModel = new UserModel();
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    logger.info('User login attempt', { username: data.username });

    const user = await this.userModel.validateLogin(data.username, data.password);
    if (!user) {
      logger.warn('Login failed', { username: data.username });
      throw new Error('Invalid credentials');
    }

    const token = generateToken(user);

    logger.info('User logged in successfully', { username: data.username, userId: user.id });

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    };
  }

  async initializeDefaultAdmin(): Promise<void> {
    await this.userModel.createDefaultAdmin();
    logger.info('Default admin user initialized');
  }
}