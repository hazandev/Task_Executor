import { Injectable, Logger, OnModuleInit, OnModuleDestroy, forwardRef, Inject } from '@nestjs/common';
import { TaskQueue } from './task.queue';
import { Task, TaskStatus } from '../interfaces/task.interface';
import { TaskEventsService } from '../events/task.events.service';
import { isServerOverloaded } from '../../common/utils/system-utils';
import { QUEUE_CHECK_INTERVAL_MS } from '../../config/task.config';
import { TaskExecutor } from '../bl/task.executor';


@Injectable()
export class TaskProcessor implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TaskProcessor.name);
  private intervalId: NodeJS.Timeout;

  constructor(
    private readonly taskQueue: TaskQueue,
    private readonly taskEventsService: TaskEventsService,
    @Inject(forwardRef(() => TaskExecutor))
    private readonly taskExecutor: TaskExecutor,
  ) {}

  onModuleInit() {
    this.logger.log(`TaskProcessor initialized. Starting queue processing interval: ${QUEUE_CHECK_INTERVAL_MS}ms`);
    this.intervalId = setInterval(() => {
      (async () => {
        await this.checkQueueAndProcess();
      })().catch(err => this.logger.error('Error in checkQueueAndProcess interval', err));
    }, QUEUE_CHECK_INTERVAL_MS); // Use QUEUE_CHECK_INTERVAL_MS from config
  }

  onModuleDestroy() {
    this.logger.log('TaskProcessor shutting down. Clearing queue processing interval.');
    clearInterval(this.intervalId);

    const remainingTasks = this.taskQueue.getTasks();
    if (remainingTasks.length > 0) {
      this.logger.log(`Remaining tasks in queue that were not processed: ${remainingTasks.length}`);
      remainingTasks.forEach(task => {
        this.logger.log(`  Task ID: ${task.id}, Status: ${task.status}, Type: ${task.type}`);
      });
    } else {
      this.logger.log('No tasks remaining in the queue.');
    }
  }

  private async checkQueueAndProcess(): Promise<void> {
    if (this.taskQueue.isEmpty()) {
      return;
    }

    if (await isServerOverloaded()) { 
      this.logger.log('Server under heavy load (checked via system-utils), skipping task processing cycle.');
      return;
    }

    const taskToProcess = this.taskQueue.peek();
    if (taskToProcess && taskToProcess.status === TaskStatus.PENDING) {
      this.logger.log(`Dequeuing task ${taskToProcess.id} for processing.`);
      const task = this.taskQueue.dequeue();
      if (task) {
        this.taskExecutor.execute(task).catch(err => {
          this.logger.error(`Error during task execution delegation for task ${task.id}`, err);
        });
      }
    }
  }
} 