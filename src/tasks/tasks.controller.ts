import {
  Controller, Post, Get, Param, Body, Sse, HttpException, HttpStatus, ParseUUIDPipe, ValidationPipe, UsePipes, Logger,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskEventsService, TaskEventMessage } from './events/task.events.service';
import { Observable } from 'rxjs';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiResponse } from '@nestjs/swagger';
import { CreateTaskDto } from './dto/create-task.dto';
import { Task, TaskStatus } from './interfaces/task.interface';
import {
  TaskNotFoundError,
  InvalidTaskTypeError,
  TaskOverloadedError,
} from './errors/task.errors';

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
  @ApiResponse({ status: 201, description: 'Task created successfully', type: Object })
  @ApiResponse({ status: 400, description: 'Invalid task type or parameters', type: InvalidTaskTypeError })
  @ApiResponse({ status: 503, description: 'Server overloaded, cannot create task', type: TaskOverloadedError })
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
  @ApiResponse({ status: 200, description: 'Task status', type: Object })
  @ApiResponse({ status: 404, description: 'Task not found', type: TaskNotFoundError })
  async getTaskStatus(@Param('id', new ParseUUIDPipe()) id: string): Promise<{ status: TaskStatus }> {
    this.logger.log(`Received request to get status for task ID: ${id}`);
    const status = await this.taskService.getTaskStatus(id);
    return { status };
  }

  @Get(':id/result')
  @ApiOperation({ summary: 'Get the result of a specific task' })
  @ApiParam({ name: 'id', description: 'Task ID (UUID)', type: String })
  @ApiResponse({ status: 200, description: 'Task result', type: Object })
  @ApiResponse({ status: 404, description: 'Task not found', type: TaskNotFoundError })
  async getTaskResult(@Param('id', new ParseUUIDPipe()) id: string): Promise<any> {
    this.logger.log(`Received request to get result for task ID: ${id}`);
    return this.taskService.getTaskResult(id);
  }

  @Sse(':id/events')
  @ApiOperation({ summary: 'Subscribe to real-time events for a specific task (SSE)' })
  @ApiResponse({ status: 200, description: 'Subscribed to task events' })
  @ApiResponse({ status: 404, description: 'Task not found', type: TaskNotFoundError })
  async sseEvents(@Param('id', new ParseUUIDPipe()) id: string): Promise<Observable<TaskEventMessage>> {
    this.logger.log(`Received request for SSE events for task ID: ${id}`);
    const task = await this.taskService.getTask(id);
    if (!task) {
      this.logger.warn(`SSE subscription attempt for non-existent task ID: ${id}`);
      throw new TaskNotFoundError(id);
    }
    return this.taskEventsService.subscribeToTask(id);
  }
} 