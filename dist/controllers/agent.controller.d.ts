import { Request, Response } from 'express';
interface AuthRequest extends Request {
    user?: {
        id: string;
        username: string;
        email: string;
        role: 'admin' | 'user';
    };
}
export declare class AgentController {
    private agentService;
    constructor();
    createAgent: (req: AuthRequest, res: Response) => Promise<void>;
    getAgent: (req: AuthRequest, res: Response) => Promise<void>;
    getAllAgents: (req: AuthRequest, res: Response) => Promise<void>;
    updateAgent: (req: AuthRequest, res: Response) => Promise<void>;
    deleteAgent: (req: AuthRequest, res: Response) => Promise<void>;
    getAgentsByCapability: (req: AuthRequest, res: Response) => Promise<void>;
    getAgentsByStatus: (req: AuthRequest, res: Response) => Promise<void>;
}
export {};
//# sourceMappingURL=agent.controller.d.ts.map