import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskStatus, TaskType } from './interfaces/task.interface';
import { TaskEntity } from './entities/task.entity';

@Injectable()
export class TaskStore {
  private readonly logger = new Logger(TaskStore.name);
  private tasks = new Map<string, Task>();

  constructor(
    @InjectRepository(TaskEntity)
    private taskRepository: Repository<TaskEntity>,
  ) {}

  async create(id: string, type: TaskType, params: number[]): Promise<Task> {
    const task: Task = {
      id,
      type,
      params,
      status: TaskStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.tasks.set(id, task);
    try {
      await this.taskRepository.save(task);
      this.logger.log(`Task ${id} created successfully in DB.`);
    } catch (error) {
      this.logger.error(`Failed to create task ${id} in DB: ${error.message}`, error.stack);
      throw error; // Re-throw the error to be handled by the caller
    }
    return task;
  }

  async findById(id: string): Promise<Task | undefined> {
    let task = this.tasks.get(id);
    if (!task) {
      const dbTask = await this.taskRepository.findOneBy({ id });
      if (dbTask) {
        task = dbTask;
        this.tasks.set(id, task);
      } else {
        return undefined; // Explicitly return undefined if not found in DB
      }
    }
    return task;
  }

  async findAll(): Promise<Task[]> {
    const allTasks = await this.taskRepository.find();
    allTasks.forEach(task => {
      if (!this.tasks.has(task.id)) {
        this.tasks.set(task.id, task);
      }
    });
    return Array.from(this.tasks.values());
  }

  async update(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>): Promise<Task | undefined> {
    let task = this.tasks.get(id);
    if (!task) {
      const dbTask = await this.taskRepository.findOneBy({ id });
      if (dbTask) {
        task = dbTask;
      } else {
        this.logger.warn(`Task ${id} not found in memory or DB for update.`);
        return undefined; // Task not found in DB
      }
    }

    const updatedInMemoryTask = { ...task, ...updates, updatedAt: new Date() };
    this.tasks.set(id, updatedInMemoryTask);

    try {
      const updateResult = await this.taskRepository.update(id, updates);
      if (updateResult.affected === 0) {
        this.logger.warn(`Task ${id} was not updated in DB (affected rows: 0).`);
        // Optionally, handle this case more specifically, e.g., by not trying to fetch again
      } else {
        this.logger.log(`Task ${id} updated in DB. Fetching updated record.`);
      }

      const updatedDbTask = await this.taskRepository.findOneBy({ id });
      if (updatedDbTask) {
        this.tasks.set(id, updatedDbTask);
        this.logger.log(`Task ${id} fetched successfully after update.`);
        return updatedDbTask;
      } else {
        this.logger.error(`Task ${id} not found in DB after supposed update. Removing from memory.`);
        // This case should ideally not happen if update was successful and ID is correct
        // but as a fallback, remove from memory if it's gone from DB
        this.tasks.delete(id);
        return undefined;
      }
    } catch (error) {
      this.logger.error(`Failed to update task ${id} in DB: ${error.message}`, error.stack);
      // Potentially revert in-memory change or handle error more gracefully
      // For now, re-throwing:
      throw error;
    }
  }

  async updateStatus(id: string, status: TaskStatus): Promise<Task | undefined> {
    return this.update(id, { status });
  }

  async setResult(id: string, result: any): Promise<Task | undefined> {
    return this.update(id, { result, status: TaskStatus.COMPLETED });
  }

  async setError(id: string, error: string): Promise<Task | undefined> {
    return this.update(id, { error, status: TaskStatus.FAILED });
  }
} 