import { Injectable, Logger } from '@nestjs/common';
import { TaskStore } from '../task.store';
import { Task, TaskStatus } from '../interfaces/task.interface';
import { TaskEventsService } from '../events/task.events.service';
import { taskHandlers, TaskType } from '../logic/task.handlers';
import { PROCESSING_DELAY_MIN_MS, PROCESSING_DELAY_MAX_MS, MIN_FREE_MEM_RATIO, MAX_CPU_LOAD_PERCENT } from '../../config/task.config';
import * as os from 'os';

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

    // Log system load
    const cpus = os.cpus();
    const totalIdle = cpus.reduce((acc, cpu) => acc + cpu.times.idle, 0);
    const totalTick = cpus.reduce((acc, cpu) => acc + Object.values(cpu.times).reduce((a, b) => a + b, 0), 0);
    const currentCpuLoad = 1 - totalIdle / totalTick;
    const freeMemory = os.freemem();
    const totalMemory = os.totalmem();
    const freeMemoryRatio = freeMemory / totalMemory;

    this.logger.log(
      `System Load: CPU Usage: ${(currentCpuLoad * 100).toFixed(2)}% < ${MAX_CPU_LOAD_PERCENT}%, Free Memory: ${(freeMemoryRatio * 100).toFixed(2)}% > ${(MIN_FREE_MEM_RATIO * 100).toFixed(2)}%`,
    );

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