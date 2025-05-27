export enum TaskType {
  SUM = 'sum',
  MULTIPLY = 'multiply',
}

export const taskHandlers: Record<TaskType, (params: number[]) => number> = {
  [TaskType.SUM]: (params) => params.reduce((acc, curr) => acc + curr, 0),
  [TaskType.MULTIPLY]: (params) => params.reduce((acc, curr) => acc * curr, 1),
}; 