"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskController = void 0;
const task_service_1 = require("../services/task.service");
const logger_1 = require("../utils/logger");
class TaskController {
    constructor() {
        this.createTask = async (req, res) => {
            try {
                const data = req.body;
                const createdBy = req.user?.id;
                if (!createdBy) {
                    res.status(401).json({
                        success: false,
                        error: 'User not authenticated'
                    });
                    return;
                }
                const task = this.taskService.createTask(data, createdBy);
                res.status(201).json({
                    success: true,
                    data: task,
                    message: 'Task created successfully'
                });
            }
            catch (error) {
                logger_1.logger.error('Error creating task:', error);
                res.status(500).json({
                    success: false,
                    error: 'Failed to create task'
                });
            }
        };
        this.getTask = async (req, res) => {
            try {
                const { id } = req.params;
                const task = this.taskService.getTask(id);
                if (!task) {
                    res.status(404).json({
                        success: false,
                        error: 'Task not found'
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    data: task
                });
            }
            catch (error) {
                logger_1.logger.error('Error getting task:', error);
                res.status(500).json({
                    success: false,
                    error: 'Failed to get task'
                });
            }
        };
        this.getAllTasks = async (req, res) => {
            try {
                const tasks = this.taskService.getAllTasks();
                res.status(200).json({
                    success: true,
                    data: tasks,
                    count: tasks.length
                });
            }
            catch (error) {
                logger_1.logger.error('Error getting tasks:', error);
                res.status(500).json({
                    success: false,
                    error: 'Failed to get tasks'
                });
            }
        };
        this.updateTask = async (req, res) => {
            try {
                const { id } = req.params;
                const data = req.body;
                const task = this.taskService.updateTask(id, data);
                if (!task) {
                    res.status(404).json({
                        success: false,
                        error: 'Task not found'
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    data: task,
                    message: 'Task updated successfully'
                });
            }
            catch (error) {
                logger_1.logger.error('Error updating task:', error);
                res.status(500).json({
                    success: false,
                    error: 'Failed to update task'
                });
            }
        };
        this.deleteTask = async (req, res) => {
            try {
                const { id } = req.params;
                const deleted = this.taskService.deleteTask(id);
                if (!deleted) {
                    res.status(404).json({
                        success: false,
                        error: 'Task not found'
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    message: 'Task deleted successfully'
                });
            }
            catch (error) {
                logger_1.logger.error('Error deleting task:', error);
                res.status(500).json({
                    success: false,
                    error: 'Failed to delete task'
                });
            }
        };
        this.assignTask = async (req, res) => {
            try {
                const { id } = req.params;
                const { agentId } = req.body;
                const task = this.taskService.assignTask(id, agentId);
                if (!task) {
                    res.status(404).json({
                        success: false,
                        error: 'Task not found'
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    data: task,
                    message: 'Task assigned successfully'
                });
            }
            catch (error) {
                logger_1.logger.error('Error assigning task:', error);
                res.status(500).json({
                    success: false,
                    error: 'Failed to assign task'
                });
            }
        };
        this.getTasksByStatus = async (req, res) => {
            try {
                const { status } = req.params;
                const tasks = this.taskService.getTasksByStatus(status);
                res.status(200).json({
                    success: true,
                    data: tasks,
                    count: tasks.length
                });
            }
            catch (error) {
                logger_1.logger.error('Error getting tasks by status:', error);
                res.status(500).json({
                    success: false,
                    error: 'Failed to get tasks by status'
                });
            }
        };
        this.getTasksByAssignee = async (req, res) => {
            try {
                const { agentId } = req.params;
                const tasks = this.taskService.getTasksByAssignee(agentId);
                res.status(200).json({
                    success: true,
                    data: tasks,
                    count: tasks.length
                });
            }
            catch (error) {
                logger_1.logger.error('Error getting tasks by assignee:', error);
                res.status(500).json({
                    success: false,
                    error: 'Failed to get tasks by assignee'
                });
            }
        };
        this.getTasksByPriority = async (req, res) => {
            try {
                const { priority } = req.params;
                const tasks = this.taskService.getTasksByPriority(priority);
                res.status(200).json({
                    success: true,
                    data: tasks,
                    count: tasks.length
                });
            }
            catch (error) {
                logger_1.logger.error('Error getting tasks by priority:', error);
                res.status(500).json({
                    success: false,
                    error: 'Failed to get tasks by priority'
                });
            }
        };
        this.taskService = new task_service_1.TaskService();
    }
}
exports.TaskController = TaskController;
//# sourceMappingURL=task.controller.js.map