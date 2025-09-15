"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskModel = void 0;
const uuid_1 = require("uuid");
class TaskModel {
    constructor() {
        this.tasks = new Map();
    }
    create(data, createdBy) {
        const task = {
            id: (0, uuid_1.v4)(),
            title: data.title,
            description: data.description,
            status: 'pending',
            priority: data.priority,
            createdBy,
            createdAt: new Date(),
            updatedAt: new Date(),
            metadata: data.metadata || {}
        };
        this.tasks.set(task.id, task);
        return task;
    }
    findById(id) {
        return this.tasks.get(id);
    }
    findAll() {
        return Array.from(this.tasks.values());
    }
    update(id, data) {
        const task = this.tasks.get(id);
        if (!task)
            return null;
        const updatedTask = {
            ...task,
            ...data,
            updatedAt: new Date(),
            completedAt: data.status === 'completed' ? new Date() : task.completedAt
        };
        this.tasks.set(id, updatedTask);
        return updatedTask;
    }
    delete(id) {
        return this.tasks.delete(id);
    }
    findByStatus(status) {
        return this.findAll().filter(task => task.status === status);
    }
    findByAssignee(agentId) {
        return this.findAll().filter(task => task.assignedTo === agentId);
    }
    findByCreator(creatorId) {
        return this.findAll().filter(task => task.createdBy === creatorId);
    }
    findByPriority(priority) {
        return this.findAll().filter(task => task.priority === priority);
    }
    assignTask(taskId, agentId) {
        const task = this.tasks.get(taskId);
        if (!task)
            return null;
        const updatedTask = {
            ...task,
            assignedTo: agentId,
            status: 'assigned',
            updatedAt: new Date()
        };
        this.tasks.set(taskId, updatedTask);
        return updatedTask;
    }
}
exports.TaskModel = TaskModel;
//# sourceMappingURL=task.model.js.map