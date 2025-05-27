import { Injectable, Logger } from '@nestjs/common';
import { TaskStore } from '../task.store';
import { Task, TaskStatus } from '../interfaces/task.interface';
import { TaskEventsService } from '../events/task.events.service';
import { taskHandlers, TaskType } from '../logic/task.handlers';
import { PROCESSING_DELAY_MIN_MS, PROCESSING_DELAY_MAX_MS } from '../../config/task.config';

@Injectable()
export class TaskExecutor {
  private readonly logger = new Logger(TaskExecutor.name);

  constructor(
    private readonly taskStore: TaskStore,
    private readonly taskEventsService: TaskEventsService,
  ) {}

  async execute(task: Task): Promise<void> {
    this.logger.log(`Starting processing for task ${task.id} (${task.type})`);
    this.updateTaskStatus(task, TaskStatus.PROCESSING);

    try {
      await this.simulateWork();

      const result = this.calculateResult(task);
      this.handleSuccess(task, result);
    } catch (error) {
      this.handleFailure(task, error);
    }
  }

  private updateTaskStatus(task: Task, status: TaskStatus): void {
    this.taskStore.updateStatus(task.id, status);
    this.taskEventsService.emitTaskUpdate({ ...task, status });
  }

  private async simulateWork(): Promise<void> {
    const delay =
      PROCESSING_DELAY_MIN_MS +
      Math.random() * (PROCESSING_DELAY_MAX_MS - PROCESSING_DELAY_MIN_MS);
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  private calculateResult(task: Task): number {
    const handler = taskHandlers[task.type as TaskType];
    if (!handler) {
      throw new Error(`Unsupported task type: ${task.type}`);
    }
    return handler(task.params);
  }

  private handleSuccess(task: Task, result: number): void {
    this.logger.log(`Task ${task.id} completed. Result: ${result}`);
    this.taskStore.setResult(task.id, result);
    this.taskEventsService.emitTaskUpdate({
      ...task,
      status: TaskStatus.COMPLETED,
      result,
    });
  }

  private handleFailure(task: Task, error: unknown): void {
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Unknown error during task processing';
    this.logger.error(
      `Error processing task ${task.id}: ${errorMessage}`,
      error instanceof Error ? error.stack : undefined,
    );
    this.taskStore.setError(task.id, errorMessage);
    this.taskEventsService.emitTaskUpdate({
      ...task,
      status: TaskStatus.FAILED,
      error: errorMessage,
    });
  }
} 