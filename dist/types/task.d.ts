export interface Task {
    id: string;
    title: string;
    description: string;
    status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'failed';
    priority: 'low' | 'medium' | 'high';
    assignedTo?: string;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    completedAt?: Date;
    metadata: Record<string, any>;
}
export interface CreateTaskRequest {
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    metadata?: Record<string, any>;
}
export interface UpdateTaskRequest {
    title?: string;
    description?: string;
    status?: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'failed';
    priority?: 'low' | 'medium' | 'high';
    assignedTo?: string;
    metadata?: Record<string, any>;
}
export interface AssignTaskRequest {
    agentId: string;
}
//# sourceMappingURL=task.d.ts.map