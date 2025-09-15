import { Task, CreateTaskRequest, UpdateTaskRequest } from '../types';
export declare class TaskService {
    private taskModel;
    constructor();
    createTask(data: CreateTaskRequest, createdBy: string): Task;
    getTask(id: string): Task | undefined;
    getAllTasks(): Task[];
    updateTask(id: string, data: UpdateTaskRequest): Task | null;
    deleteTask(id: string): boolean;
    assignTask(taskId: string, agentId: string): Task | null;
    getTasksByStatus(status: Task['status']): Task[];
    getTasksByAssignee(agentId: string): Task[];
    getTasksByCreator(creatorId: string): Task[];
    getTasksByPriority(priority: Task['priority']): Task[];
}
//# sourceMappingURL=task.service.d.ts.map