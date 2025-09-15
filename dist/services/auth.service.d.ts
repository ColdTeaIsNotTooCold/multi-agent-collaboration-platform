import { LoginRequest, LoginResponse } from '../types';
export declare class AuthService {
    private userModel;
    constructor();
    login(data: LoginRequest): Promise<LoginResponse>;
    initializeDefaultAdmin(): Promise<void>;
}
//# sourceMappingURL=auth.service.d.ts.map