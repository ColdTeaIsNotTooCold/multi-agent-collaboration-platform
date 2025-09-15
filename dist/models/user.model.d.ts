import { User } from '../types';
export declare class UserModel {
    private users;
    create(username: string, email: string, password: string, role?: 'admin' | 'user'): Promise<User>;
    findByUsername(username: string): Promise<User | undefined>;
    findByEmail(email: string): Promise<User | undefined>;
    findById(id: string): User | undefined;
    findAll(): User[];
    validateLogin(username: string, password: string): Promise<User | null>;
    createDefaultAdmin(): Promise<void>;
}
//# sourceMappingURL=user.model.d.ts.map