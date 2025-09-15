import { User, LoginRequest } from '../types';
import { hashPassword, comparePassword } from '../utils/bcrypt';
import { prisma } from '../utils/database';

export class UserModel {
  async create(username: string, email: string, password: string, role: 'admin' | 'user' = 'user'): Promise<User> {
    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: role.toUpperCase() as 'USER' | 'ADMIN'
      }
    });

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      password: user.password,
      role: user.role.toLowerCase() as 'admin' | 'user',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }

  async findByUsername(username: string): Promise<User | undefined> {
    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) return undefined;

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      password: user.password,
      role: user.role.toLowerCase() as 'admin' | 'user',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) return undefined;

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      password: user.password,
      role: user.role.toLowerCase() as 'admin' | 'user',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }

  async findById(id: string): Promise<User | undefined> {
    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) return undefined;

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      password: user.password,
      role: user.role.toLowerCase() as 'admin' | 'user',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }

  async findAll(): Promise<User[]> {
    const users = await prisma.user.findMany();

    return users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      password: user.password,
      role: user.role.toLowerCase() as 'admin' | 'user',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }));
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