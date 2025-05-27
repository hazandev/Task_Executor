import { Injectable } from '@nestjs/common';

interface CachedTaskValue {
  id: string;
  result?: any;
}

@Injectable()
export class TaskCache {
  private cache = new Map<string, CachedTaskValue>();

  get(taskName: string, params: number[]): CachedTaskValue | undefined {
    const key = this.generateKey(taskName, params);
    return this.cache.get(key);
  }

  set(taskName: string, params: number[], id: string, result?: any): void {
    const key = this.generateKey(taskName, params);
    this.cache.set(key, { id, result });
  }

  private generateKey(taskName: string, params: number[]): string {
    // Simple key generation, consider more robust hashing for complex params
    const sortedParams = params.sort();
    return `${taskName}:${JSON.stringify(sortedParams)}`;
  }
} 