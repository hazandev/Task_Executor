export enum TaskStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum TaskType {
  SUM = 'sum',
  MULTIPLY = 'multiply',
}

export interface Task {
  id: string;
  type: TaskType;
  params: number[];
  status: TaskStatus;
  result?: any;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
} 