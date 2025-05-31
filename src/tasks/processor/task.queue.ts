import { Injectable, Logger } from '@nestjs/common';
import { Task } from '../interfaces/task.interface';
import { EventEmitter } from 'events';

@Injectable()
export class TaskQueue extends EventEmitter {
  private queue: Task[] = [];

  enqueue(task: Task) {
    this.queue.push(task);
    this.emit('taskAdded');
  }

  dequeue(): Task | undefined {
    if (this.isEmpty()) {
      return undefined;
    }
    const task = this.queue.shift();
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
    return [...this.queue];
  }
} 