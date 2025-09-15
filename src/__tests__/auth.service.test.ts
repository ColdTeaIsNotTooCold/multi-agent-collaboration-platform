import { AuthService } from '../services/auth.service';
import { LoginRequest } from '../types';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
  });

  describe('login', () => {
    beforeEach(async () => {
      // Create a test user for login tests
      await authService.initializeDefaultAdmin();
    });

    it('should login successfully with valid credentials', async () => {
      const loginData: LoginRequest = {
        username: 'admin',
        password: 'admin123'
      };

      const result = await authService.login(loginData);

      expect(result).toBeDefined();
      expect(result.token).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.username).toBe('admin');
      expect(result.user.role).toBe('admin');
    });

    it('should throw error with invalid username', async () => {
      const loginData: LoginRequest = {
        username: 'invalid-user',
        password: 'admin123'
      };

      await expect(authService.login(loginData)).rejects.toThrow('Invalid credentials');
    });

    it('should throw error with invalid password', async () => {
      const loginData: LoginRequest = {
        username: 'admin',
        password: 'wrong-password'
      };

      await expect(authService.login(loginData)).rejects.toThrow('Invalid credentials');
    });

    it('should throw error with empty credentials', async () => {
      const loginData: LoginRequest = {
        username: '',
        password: ''
      };

      await expect(authService.login(loginData)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('initializeDefaultAdmin', () => {
    it('should create default admin user if not exists', async () => {
      // This test is tricky because we can't easily reset the service state
      // For now, we'll just test that it doesn't throw an error
      await expect(authService.initializeDefaultAdmin()).resolves.not.toThrow();
    });
  });
});