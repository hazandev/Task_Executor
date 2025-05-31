import { Injectable, Logger, NotFoundException } from '@nestjs/common';
// import { InjectQueue } from '@nestjs/bullmq'; // Removed BullMQ
// import { Queue } from 'bullmq'; // Removed BullMQ
import { v4 as uuidv4 } from 'uuid';
import { TaskRepository } from './task.repository';
import { TaskCache } from './cache/task.cache';
import { TaskEventsService } from './events/task.events.service';
import { Task, TaskStatus, TaskType } from './interfaces/task.interface'; // Changed TaskName to TaskType
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskQueue } from './processor/task.queue'; // Import TaskQueue

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);

  constructor(
    private readonly taskQueue: TaskQueue, // Inject TaskQueue
    private readonly taskRepository: TaskRepository,
    private readonly taskCache: TaskCache,
    private readonly taskEventsService: TaskEventsService,
  ) {}

  async createTask(
    createTaskDto: CreateTaskDto,
  ): Promise<Task> {
    const { type, params } = createTaskDto;
    const taskType = type as TaskType; // Ensure it's cast to TaskType for store and cache operations

    const cachedId = this.taskCache.get(taskType, params);
    let existingTask: Task | undefined = undefined;
    if (cachedId) {
      existingTask = await this.taskRepository.findById(cachedId.id);
    }

    if (existingTask) {
      this.logger.log(`Cache hit for task type '${taskType}' with params ${JSON.stringify(params)}. Task ID: ${existingTask.id}, Status: ${existingTask.status}`);
      return existingTask;
    }
    const taskId = uuidv4();
    // Ensure 'create' is awaited and the result is used
    const newTask = await this.taskRepository.create(taskId, taskType, params);
    this.taskCache.set(taskType, params, taskId);

    this.taskQueue.enqueue(newTask); // Use the resolved task object

    this.taskEventsService.emitTaskUpdate(newTask); // Use the resolved task object
    this.logger.log(`Task ${taskId} ('${taskType}') created and enqueued. Status: ${newTask.status}`);
    return newTask; // Return the resolved task object
  }

  async getTask(id: string): Promise<Task | undefined> {
    return this.taskRepository.findById(id);
  }

  async getTaskStatus(id: string): Promise<TaskStatus> {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      this.logger.warn(`Status request for non-existent task ID: ${id}`);
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task.status;
  }

  async getTaskResult(id: string): Promise<{ result?: any; error?: string; status: TaskStatus; message?: string }> {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      this.logger.warn(`Result request for non-existent task ID: ${id}`);
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    if (task.status === TaskStatus.FAILED) {
      return { error: task.error, status: task.status };
    }
    if (task.status !== TaskStatus.COMPLETED) {
      return { message: 'Task is not yet completed.', status: task.status };
    }
    return { result: task.result, status: task.status };
  }

  async getAllTasks(): Promise<Task[]> {
    return this.taskRepository.findAll();
  }
} 