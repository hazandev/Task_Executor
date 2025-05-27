import {
  Controller, Post, Get, Param, Body, Sse, HttpException, HttpStatus, ParseUUIDPipe, ValidationPipe, UsePipes, Logger,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskEventsService, TaskEventMessage } from './events/task.events.service';
import { Observable } from 'rxjs';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiResponse } from '@nestjs/swagger';
import { CreateTaskDto } from './dto/create-task.dto';
import { Task, TaskStatus } from './interfaces/task.interface';

@ApiTags('Tasks')
@Controller('tasks')
export class TasksController {
  private readonly logger = new Logger(TasksController.name);

  constructor(
    private readonly taskService: TaskService,
    private readonly taskEventsService: TaskEventsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task (sum or multiply)' })
  @ApiBody({ type: CreateTaskDto, description: 'Type and parameters for the task' })
  async createTask(
    @Body(new ValidationPipe()) createTaskDto: CreateTaskDto,
  ): Promise<{ taskId: string }> {
    const task = await this.taskService.createTask(createTaskDto);
    return { taskId: task.id };
  }

  @Get('all/status')
  @ApiOperation({ summary: 'Get status of all tasks' })
  @ApiResponse({ status: 200, description: 'List of all tasks and their status', type: [Object] })
  async getAllTasksStatus(): Promise<Task[]> {
    this.logger.log('Received request to get status of all tasks');
    return this.taskService.getAllTasks();
  }

  @Get(':id/status')
  @ApiOperation({ summary: 'Get the status of a specific task' })
  @ApiParam({ name: 'id', description: 'Task ID (UUID)', type: String })
  async getTaskStatus(@Param('id', new ParseUUIDPipe()) id: string): Promise<{ status: TaskStatus }> {
    this.logger.log(`Received request to get status for task ID: ${id}`);
    const status = await this.taskService.getTaskStatus(id);
    return { status };
  }

  @Get(':id/result')
  @ApiOperation({ summary: 'Get the result of a specific task' })
  @ApiParam({ name: 'id', description: 'Task ID (UUID)', type: String })
  async getTaskResult(@Param('id', new ParseUUIDPipe()) id: string): Promise<any> {
    this.logger.log(`Received request to get result for task ID: ${id}`);
    return this.taskService.getTaskResult(id);
  }

  @Sse(':id/events')
  @ApiOperation({ summary: 'Subscribe to real-time events for a specific task (SSE)' })
  async sseEvents(@Param('id', new ParseUUIDPipe()) id: string): Promise<Observable<TaskEventMessage>> {
    this.logger.log(`Received request for SSE events for task ID: ${id}`);
    const task = await this.taskService.getTask(id);
    if (!task) {
      this.logger.warn(`SSE subscription attempt for non-existent task ID: ${id}`);
      throw new HttpException('Task not found, cannot subscribe to events', HttpStatus.NOT_FOUND);
    }
    return this.taskEventsService.subscribeToTask(id);
  }
} 