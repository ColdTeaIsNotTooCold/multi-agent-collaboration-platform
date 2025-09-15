export interface User {
    id: string;
    username: string;
    email: string;
    password: string;
    role: 'admin' | 'user';
    createdAt: Date;
    updatedAt: Date;
}
export interface LoginRequest {
    username: string;
    password: string;
}
export interface LoginResponse {
    token: string;
    user: {
        id: string;
        username: string;
        email: string;
        role: 'admin' | 'user';
    };
}
//# sourceMappingURL=user.d.ts.map