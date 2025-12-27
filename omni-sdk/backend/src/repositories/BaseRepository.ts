/**
 * Base repository utilities - eliminates repetitive try-catch and error handling
 */

export interface IupsertParams<T> {
  id: string | any;
  data: T;
  existingCheck?: () => Promise<any>;
}

/**
 * Wraps repository operations with consistent error handling
 * Eliminates repetitive try-catch blocks
 */
export async function withErrorHandling<T>(
  operationName: string,
  fn: () => Promise<T>
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    console.error(`Error in ${operationName}:`, error);
    throw error;
  }
}

/**
 * Idempotent upsert pattern - check if exists, then insert or update
 * Eliminates repetitive existence checks
 */
export async function withIdempotency<T>(
  operationName: string,
  idValue: string,
  checkFn: () => Promise<T[]>,
  insertFn: () => Promise<T[]>
): Promise<T> {
  return withErrorHandling(operationName, async () => {
    const existing = await checkFn();

    if (existing.length > 0) {
      console.log(`[${operationName}] ID ${idValue} already exists, skipping`);
      return existing[0];
    }

    const result = await insertFn();
    return result[0];
  });
}
