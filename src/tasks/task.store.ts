import { Injectable } from '@nestjs/common';
import { Task, TaskStatus, TaskType } from './interfaces/task.interface';

@Injectable()
export class TaskStore {
  private tasks = new Map<string, Task>();

  create(id: string, type: TaskType, params: number[]): Task {
    const task: Task = {
      id,
      type,
      params,
      status: TaskStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.tasks.set(id, task);
    return task;
  }

  findById(id: string): Task | undefined {
    return this.tasks.get(id);
  }

  findAll(): Task[] {
    return Array.from(this.tasks.values());
  }

  update(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>): Task | undefined {
    const task = this.tasks.get(id);
    if (task) {
      const updatedTask = { ...task, ...updates, updatedAt: new Date() };
      this.tasks.set(id, updatedTask);
      return updatedTask;
    }
    return undefined;
  }

  updateStatus(id: string, status: TaskStatus): Task | undefined {
    return this.update(id, { status });
  }

  setResult(id: string, result: any): Task | undefined {
    return this.update(id, { result, status: TaskStatus.COMPLETED });
  }

  setError(id: string, error: string): Task | undefined {
    return this.update(id, { error, status: TaskStatus.FAILED });
  }
} 