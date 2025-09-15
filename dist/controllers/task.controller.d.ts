import { Request, Response } from 'express';
interface AuthRequest extends Request {
    user?: {
        id: string;
        username: string;
        email: string;
        role: 'admin' | 'user';
    };
}
export declare class TaskController {
    private taskService;
    constructor();
    createTask: (req: AuthRequest, res: Response) => Promise<void>;
    getTask: (req: AuthRequest, res: Response) => Promise<void>;
    getAllTasks: (req: AuthRequest, res: Response) => Promise<void>;
    updateTask: (req: AuthRequest, res: Response) => Promise<void>;
    deleteTask: (req: AuthRequest, res: Response) => Promise<void>;
    assignTask: (req: AuthRequest, res: Response) => Promise<void>;
    getTasksByStatus: (req: AuthRequest, res: Response) => Promise<void>;
    getTasksByAssignee: (req: AuthRequest, res: Response) => Promise<void>;
    getTasksByPriority: (req: AuthRequest, res: Response) => Promise<void>;
}
export {};
//# sourceMappingURL=task.controller.d.ts.map