import * as si from 'systeminformation';
import { MIN_FREE_MEM_RATIO, MAX_CPU_LOAD_PERCENT } from '../../config/task.config';

export async function isServerOverloaded(
  cpuThresholdPercent: number = MAX_CPU_LOAD_PERCENT,
  minFreeMemoryRatio: number = MIN_FREE_MEM_RATIO,
): Promise<boolean> {
  try {
    const [cpuLoad, mem] = await Promise.all([si.currentLoad(), si.mem()]);

    const currentCpuLoadPercent = cpuLoad.currentLoad;
    const currentFreeMemoryRatio = mem.free / mem.total;
    
    const cpuOverloaded = currentCpuLoadPercent > cpuThresholdPercent;
    const memoryOverloaded = currentFreeMemoryRatio < minFreeMemoryRatio;

    if (cpuOverloaded) {
      console.warn(`CPU usage high: ${currentCpuLoadPercent.toFixed(2)}% (Threshold: ${cpuThresholdPercent}%)`);
    }
    if (memoryOverloaded) {
      console.warn(`Free memory ratio low: ${currentFreeMemoryRatio.toFixed(2)} (Threshold: < ${minFreeMemoryRatio})`);
    }

    return cpuOverloaded || memoryOverloaded;
  } catch (error) {
    console.error('Error getting system information for load check:', error);
    return false; // Default to not overloaded on error to avoid blocking tasks unnecessarily
  }
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
} 