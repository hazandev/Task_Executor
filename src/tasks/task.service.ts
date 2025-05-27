import { Injectable, Logger, NotFoundException } from '@nestjs/common';
// import { InjectQueue } from '@nestjs/bullmq'; // Removed BullMQ
// import { Queue } from 'bullmq'; // Removed BullMQ
import { v4 as uuidv4 } from 'uuid';
import { TaskStore } from './task.store';
import { TaskCache } from './cache/task.cache';
import { TaskEventsService } from './events/task.events.service';
import { Task, TaskStatus, TaskType } from './interfaces/task.interface'; // Changed TaskName to TaskType
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskQueue } from './processor/task.queue'; // Import TaskQueue

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);

  constructor(
    // @InjectQueue('tasks') private readonly tasksQueue: Queue, // Removed BullMQ
    private readonly taskQueue: TaskQueue, // Inject TaskQueue
    private readonly taskStore: TaskStore,
    private readonly taskCache: TaskCache,
    private readonly taskEventsService: TaskEventsService,
  ) {}

  async createTask(
    createTaskDto: CreateTaskDto,
  ): Promise<Task> {
    const { type, params } = createTaskDto;
    const taskType = type as TaskType; // Ensure it's cast to TaskType for store and cache operations

    const cached = this.taskCache.get(taskType, params);
    const existingTask = cached ? this.taskStore.findById(cached.id) : null;
    if (existingTask) {
      this.logger.log(`Cache hit for task type '${taskType}' with params ${JSON.stringify(params)}. Task ID: ${existingTask.id}, Status: ${existingTask.status}`);
      return existingTask;
    }
    const taskId = uuidv4();
    const task = this.taskStore.create(taskId, taskType, params); 
    this.taskCache.set(taskType, params, taskId);

    this.taskQueue.enqueue(task);

    this.taskEventsService.emitTaskUpdate(task);
    this.logger.log(`Task ${taskId} ('${taskType}') created and enqueued. Status: ${task.status}`);
    return task;
  }

  getTask(id: string): Task | undefined {
    return this.taskStore.findById(id);
  }

  getTaskStatus(id: string): TaskStatus {
    const task = this.taskStore.findById(id);
    if (!task) {
      this.logger.warn(`Status request for non-existent task ID: ${id}`);
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task.status;
  }

  getTaskResult(id: string): { result?: any; error?: string; status: TaskStatus; message?: string } {
    const task = this.taskStore.findById(id);
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

  getAllTasks(): Task[] {
    return this.taskStore.findAll();
  }
} 