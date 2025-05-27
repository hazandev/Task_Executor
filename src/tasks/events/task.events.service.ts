import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter'; // Using EventEmitter2 for more robust event handling
import { Observable, fromEvent, map } from 'rxjs';
import { Task, TaskStatus } from '../interfaces/task.interface';

// Define a specific type for the SSE message event data for clarity
export interface TaskEventMessage {
  data: Task; // Send the whole task object for updates
  id?: string; // SSE event ID (optional, could be task.id)
  type?: 'taskUpdate' | 'taskError'; // Custom event type (optional)
}

@Injectable()
export class TaskEventsService implements OnModuleDestroy {
  // private readonly emitter = new EventEmitter(); // Original EventEmitter
  constructor(private eventEmitter: EventEmitter2) {}

  subscribeToTask(taskId: string): Observable<TaskEventMessage> {
    // Use EventEmitter2's `on` method via fromEvent, or directly manage listeners
    return fromEvent<Task>(this.eventEmitter, `task.${taskId}.update`).pipe(
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
    // Clean up listeners if necessary, EventEmitter2 might have its own mechanisms
    // For simplicity, if direct listener management was used, it would be here.
    this.eventEmitter.removeAllListeners(); 
  }
} 