import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { TaskStatus, TaskType } from '../interfaces/task.interface';

@Entity('tasks')
export class TaskEntity {
  @PrimaryColumn()
  id: string;

  @Column({ type: 'simple-enum', enum: TaskType })
  type: TaskType;

  @Column({ type: 'simple-array', nullable: true })
  params: number[];

  @Column({ type: 'simple-enum', enum: TaskStatus, default: TaskStatus.PENDING })
  status: TaskStatus;

  @Column({ type: 'simple-json', nullable: true })
  result: any;

  @Column({ nullable: true })
  error: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 