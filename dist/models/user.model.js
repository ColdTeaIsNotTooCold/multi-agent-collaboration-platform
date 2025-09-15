"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const uuid_1 = require("uuid");
const bcrypt_1 = require("../utils/bcrypt");
class UserModel {
    constructor() {
        this.users = new Map();
    }
    async create(username, email, password, role = 'user') {
        const hashedPassword = await (0, bcrypt_1.hashPassword)(password);
        const user = {
            id: (0, uuid_1.v4)(),
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
    async findByUsername(username) {
        return Array.from(this.users.values()).find(user => user.username === username);
    }
    async findByEmail(email) {
        return Array.from(this.users.values()).find(user => user.email === email);
    }
    findById(id) {
        return this.users.get(id);
    }
    findAll() {
        return Array.from(this.users.values());
    }
    async validateLogin(username, password) {
        const user = await this.findByUsername(username);
        if (!user)
            return null;
        const isValid = await (0, bcrypt_1.comparePassword)(password, user.password);
        return isValid ? user : null;
    }
    async createDefaultAdmin() {
        const adminExists = await this.findByUsername('admin');
        if (!adminExists) {
            await this.create('admin', 'admin@example.com', 'admin123', 'admin');
        }
    }
}
exports.UserModel = UserModel;
//# sourceMappingURL=user.model.js.map