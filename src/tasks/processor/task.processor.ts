import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { TaskQueue } from './task.queue';
import { TaskStatus } from '../interfaces/task.interface';
import { isServerOverloaded } from '../../common/utils/system-utils';
import { TaskExecutor } from '../bl/task.executor';


@Injectable()
export class TaskProcessor implements OnModuleInit {
  private readonly logger = new Logger(TaskProcessor.name);
  private isProcessing = false;

  constructor(
    private readonly taskQueue: TaskQueue,
    private readonly taskExecutor: TaskExecutor,
  ) {}

  onModuleInit() {
    this.logger.log(`TaskProcessor initialized. Listening for taskAdded events.`);
    this.taskQueue.on('taskAdded', async () => {
      if (this.isProcessing) return;
      this.isProcessing = true;

      try {
        while (!this.taskQueue.isEmpty() && !(await isServerOverloaded())) {
          const task = this.taskQueue.dequeue();
          if (task && task.status === TaskStatus.PENDING) {
            this.logger.log(`Processing task ${task.id} from queue.`);
            await this.taskExecutor.execute(task);
          }
        }
      } catch (err) {
        this.logger.error('Error while processing task queue:', err);
      } finally {
        this.isProcessing = false;
      }
    });
  }
} 