"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskService = void 0;
const task_model_1 = require("../models/task.model");
const logger_1 = require("../utils/logger");
class TaskService {
    constructor() {
        this.taskModel = new task_model_1.TaskModel();
    }
    createTask(data, createdBy) {
        logger_1.logger.info('Creating new task', { title: data.title, priority: data.priority, createdBy });
        return this.taskModel.create(data, createdBy);
    }
    getTask(id) {
        return this.taskModel.findById(id);
    }
    getAllTasks() {
        return this.taskModel.findAll();
    }
    updateTask(id, data) {
        logger_1.logger.info('Updating task', { id, data });
        return this.taskModel.update(id, data);
    }
    deleteTask(id) {
        logger_1.logger.info('Deleting task', { id });
        return this.taskModel.delete(id);
    }
    assignTask(taskId, agentId) {
        logger_1.logger.info('Assigning task', { taskId, agentId });
        return this.taskModel.assignTask(taskId, agentId);
    }
    getTasksByStatus(status) {
        return this.taskModel.findByStatus(status);
    }
    getTasksByAssignee(agentId) {
        return this.taskModel.findByAssignee(agentId);
    }
    getTasksByCreator(creatorId) {
        return this.taskModel.findByCreator(creatorId);
    }
    getTasksByPriority(priority) {
        return this.taskModel.findByPriority(priority);
    }
}
exports.TaskService = TaskService;
//# sourceMappingURL=task.service.js.map