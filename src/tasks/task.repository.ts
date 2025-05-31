import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskStatus, TaskType } from './interfaces/task.interface';
import { TaskEntity } from './entities/task.entity';

@Injectable()
export class TaskRepository {
  private readonly logger = new Logger(TaskRepository.name);

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

    try {
      await this.taskRepository.save(task);
      this.logger.log(`Task ${id} created successfully in DB.`);
      return task;
    } catch (error) {
      this.logger.error(`Failed to create task ${id} in DB: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findById(id: string): Promise<Task | undefined> {
    try {
      const taskEntity = await this.taskRepository.findOneBy({ id });
      return taskEntity ? taskEntity : undefined;
    } catch (error) {
      this.logger.error(`Failed to find task ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll(): Promise<Task[]> {
    try {
      return await this.taskRepository.find();
    } catch (error) {
      this.logger.error(`Failed to find all tasks: ${error.message}`, error.stack);
      throw error;
    }
  }

  async update(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>): Promise<Task | undefined> {
    try {
      const existingTask = await this.taskRepository.findOneBy({ id });

      if (!existingTask) {
        this.logger.warn(`Task ${id} not found for update.`);
        return undefined;
      }

      const updatedTask: Task = {
        ...existingTask,
        ...updates,
        updatedAt: new Date(),
      };

      await this.taskRepository.save(updatedTask);

      this.logger.log(`Task ${id} updated successfully.`);
      return updatedTask;
    } catch (error) {
      this.logger.error(`Failed to update task ${id}: ${error.message}`, error.stack);
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