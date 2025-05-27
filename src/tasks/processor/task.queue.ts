import { Injectable, Logger } from '@nestjs/common';
import { Task } from '../interfaces/task.interface';

@Injectable()
export class TaskQueue {
  private readonly queue: Task[] = [];
  private readonly logger = new Logger(TaskQueue.name);

  enqueue(task: Task): void {
    this.queue.push(task);
    this.logger.log(`Task ${task.id} enqueued. Queue size: ${this.queue.length}`);
  }

  dequeue(): Task | undefined {
    if (this.isEmpty()) {
      return undefined;
    }
    const task = this.queue.shift();
    if (task) {
      this.logger.log(`Task ${task.id} dequeued. Queue size: ${this.queue.length}`);
    }
    return task;
  }

  peek(): Task | undefined {
    return this.queue[0];
  }

  isEmpty(): boolean {
    return this.queue.length === 0;
  }

  get length(): number {
    return this.queue.length;
  }

  getTasks(): Task[] {
    return [...this.queue]; // Return a copy to prevent external modification
  }
} 