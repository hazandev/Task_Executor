import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter'; 
import { Observable, fromEvent, map } from 'rxjs';
import { Task, TaskStatus } from '../interfaces/task.interface';

export interface TaskEventMessage {
  data: Task; // Send the whole task object for updates
  id?: string; // SSE event ID (optional, could be task.id)
  type?: 'taskUpdate' | 'taskError'; // Custom event type (optional)
}

@Injectable()
export class TaskEventsService implements OnModuleDestroy {
  constructor(private eventEmitter: EventEmitter2) {}

  subscribeToTask(taskId: string): Observable<TaskEventMessage> {
    return fromEvent(this.eventEmitter, `task.${taskId}.update`, (taskPayload: Task): Task => taskPayload).pipe(
      map((taskPayload: Task) => {
        return { 
          data: taskPayload, 
          type: taskPayload.status === TaskStatus.FAILED ? 'taskError' : 'taskUpdate',
          id: taskPayload.id
        } as TaskEventMessage;
      }),
    );
  }

  emitTaskUpdate(task: Task): void {
    this.eventEmitter.emit(`task.${task.id}.update`, task);
  }

  onModuleDestroy() {
    this.eventEmitter.removeAllListeners(); 
  }
} 