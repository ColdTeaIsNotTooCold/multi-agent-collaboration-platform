import { Task, CreateTaskRequest, UpdateTaskRequest } from '../types';
export declare class TaskModel {
    private tasks;
    create(data: CreateTaskRequest, createdBy: string): Task;
    findById(id: string): Task | undefined;
    findAll(): Task[];
    update(id: string, data: UpdateTaskRequest): Task | null;
    delete(id: string): boolean;
    findByStatus(status: Task['status']): Task[];
    findByAssignee(agentId: string): Task[];
    findByCreator(creatorId: string): Task[];
    findByPriority(priority: Task['priority']): Task[];
    assignTask(taskId: string, agentId: string): Task | null;
}
//# sourceMappingURL=task.model.d.ts.map