import pool from '../config/database.js';

/**
 * Execute a function within a database transaction
 * Automatically commits on success or rolls back on error
 */
export async function withTransaction<T>(
  callback: (connection: any) => Promise<T>
): Promise<T> {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Execute multiple queries in a single transaction
 */
export async function executeInTransaction(
  queries: Array<{ query: string; params?: any[] }>
): Promise<any[]> {
  return withTransaction(async (connection) => {
    const results = [];
    for (const { query, params } of queries) {
      const [result] = await connection.query(query, params || []);
      results.push(result);
    }
    return results;
  });
}

