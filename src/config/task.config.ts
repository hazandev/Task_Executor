import * as dotenv from 'dotenv';

function getEnvVarAsFloat(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (value === undefined || value === null || value.trim() === '') {
    console.warn(`Environment variable ${key} not set or empty, using default value: ${defaultValue}`);
    return defaultValue;
  }
  const parsed = parseFloat(value);
  if (isNaN(parsed)) {
    console.warn(`Failed to parse environment variable ${key} ('${value}') as float, using default value: ${defaultValue}`);
    return defaultValue;
  }
  return parsed;
}

function getEnvVarAsInt(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (value === undefined || value === null || value.trim() === '') {
    console.warn(`Environment variable ${key} not set or empty, using default value: ${defaultValue}`);
    return defaultValue;
  }
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    console.warn(`Failed to parse environment variable ${key} ('${value}') as integer, using default value: ${defaultValue}`);
    return defaultValue;
  }
  return parsed;
}

// Configuration values with type safety and fallbacks
export const MIN_FREE_MEM_RATIO: number = getEnvVarAsFloat('MIN_FREE_MEM_RATIO', 0.05); // e.g., 0.2 for 20% free memory minimum
export const MAX_CPU_LOAD_PERCENT: number = getEnvVarAsFloat('MAX_CPU_LOAD_PERCENT', 0.5) * 100; // e.g., 0.7 for 70% max CPU load, converted to percent
export const QUEUE_CHECK_INTERVAL_MS: number = getEnvVarAsInt('QUEUE_CHECK_INTERVAL_MS', 3000); // Default to 3000ms
export const PROCESSING_DELAY_MIN_MS: number = getEnvVarAsInt('PROCESSING_DELAY_MIN_MS', 2000); // Default to 2000ms
export const PROCESSING_DELAY_MAX_MS: number = getEnvVarAsInt('PROCESSING_DELAY_MAX_MS', 5000); // Default to 5000ms

if (MIN_FREE_MEM_RATIO < 0 || MIN_FREE_MEM_RATIO > 1) {
  console.warn(`MIN_FREE_MEM_RATIO (${MIN_FREE_MEM_RATIO}) is outside the recommended range (0-1). Please check your .env configuration.`);
}

if (MAX_CPU_LOAD_PERCENT < 0 || MAX_CPU_LOAD_PERCENT > 100) {
  console.warn(`MAX_CPU_LOAD_PERCENT (${MAX_CPU_LOAD_PERCENT}) is outside the recommended range (0-100 after conversion). Please check your .env configuration for MAX_CPU_LOAD_PERCENT (expected as a ratio like 0.7).`);
}

console.log('Task Configuration Loaded:');
console.log(`  MIN_FREE_MEM_RATIO: ${MIN_FREE_MEM_RATIO}`);
console.log(`  MAX_CPU_LOAD_PERCENT: ${MAX_CPU_LOAD_PERCENT}`);
console.log(`  QUEUE_CHECK_INTERVAL_MS: ${QUEUE_CHECK_INTERVAL_MS}`);
console.log(`  PROCESSING_DELAY_MIN_MS: ${PROCESSING_DELAY_MIN_MS}`);
console.log(`  PROCESSING_DELAY_MAX_MS: ${PROCESSING_DELAY_MAX_MS}`); 