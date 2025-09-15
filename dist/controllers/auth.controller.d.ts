import { Request, Response } from 'express';
interface AuthRequest extends Request {
    user?: {
        id: string;
        username: string;
        email: string;
        role: 'admin' | 'user';
    };
}
export declare class AuthController {
    private authService;
    constructor();
    login: (req: Request, res: Response) => Promise<void>;
    getProfile: (req: AuthRequest, res: Response) => Promise<void>;
    initializeDefaultAdmin: () => Promise<void>;
}
export {};
//# sourceMappingURL=auth.controller.d.ts.map