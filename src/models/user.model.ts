import { User, LoginRequest } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { hashPassword, comparePassword } from '../utils/bcrypt';

export class UserModel {
  private users: Map<string, User> = new Map();

  async create(username: string, email: string, password: string, role: 'admin' | 'user' = 'user'): Promise<User> {
    const hashedPassword = await hashPassword(password);

    const user: User = {
      id: uuidv4(),
      username,
      email,
      password: hashedPassword,
      role,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.users.set(user.id, user);
    return user;
  }

  async findByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  findById(id: string): User | undefined {
    return this.users.get(id);
  }

  findAll(): User[] {
    return Array.from(this.users.values());
  }

  async validateLogin(username: string, password: string): Promise<User | null> {
    const user = await this.findByUsername(username);
    if (!user) return null;

    const isValid = await comparePassword(password, user.password);
    return isValid ? user : null;
  }

  async createDefaultAdmin(): Promise<void> {
    const adminExists = await this.findByUsername('admin');
    if (!adminExists) {
      await this.create('admin', 'admin@example.com', 'admin123', 'admin');
    }
  }
}