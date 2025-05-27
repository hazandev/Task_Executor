// src/dto/create-task.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsEnum, IsNumber } from 'class-validator';
import { TaskType } from '../interfaces/task.interface';

export class CreateTaskDto {
  @ApiProperty({
    example: TaskType.SUM,
    description: 'Type of the task',
    enum: TaskType,
  })
  @IsEnum(TaskType)
  @IsNotEmpty()
  type: TaskType;

  @ApiProperty({
    example: [1, 2, 3],
    description: 'Parameters for the task (numbers for sum/multiply)',
    type: [Number],
  })
  @IsArray()
  @IsNotEmpty()
  @IsNumber({}, { each: true })
  params: number[];
}
