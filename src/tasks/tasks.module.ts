import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksController } from './tasks.controller';
import { TaskService } from './task.service';
import { TaskProcessor } from './processor/task.processor';
import { TaskRepository } from './task.repository';
import { TaskCache } from './cache/task.cache';
import { TaskEventsService } from './events/task.events.service';
import { TaskQueue } from './processor/task.queue';
import { TaskExecutor } from './bl/task.executor';
import { TaskEntity } from './entities/task.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TaskEntity])],
  controllers: [TasksController],
  providers: [
    TaskService,
    TaskProcessor,
    TaskQueue,
    TaskRepository,
    TaskCache,
    TaskEventsService,
    TaskExecutor,
  ],
  exports: [TaskService, TaskRepository, TaskQueue, TypeOrmModule], // Export TaskQueue if needed elsewhere
})
export class TasksModule {} 