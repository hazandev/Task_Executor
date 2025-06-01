import {
  NotFoundException,
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';

export class TaskNotFoundError extends NotFoundException {
  constructor(id?: string) {
    super(id ? `Task with ID ${id} was not found.` : 'Task was not found.');
  }
}

export class InvalidTaskTypeError extends BadRequestException {
  constructor(type: string) {
    super(`Unsupported task type: '${type}'.`);
  }
}

export class TaskOverloadedError extends ServiceUnavailableException {
  constructor() {
    super(`Server is currently overloaded. Please try again later.`);
  }
} 