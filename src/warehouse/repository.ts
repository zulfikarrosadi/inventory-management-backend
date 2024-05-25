import { ResultSetHeader } from 'mysql2';
import { CreateWarehouse } from './schema';
import pool from '../db';

export async function saveWarehouse(
  data: CreateWarehouse,
): Promise<ResultSetHeader | Error> {
  try {
    const result = await pool.execute(
      'INSERT INTO warehouses (name, address) VALUES (?,?)',
      [data.name, data.address],
    );

    return result as unknown as ResultSetHeader;
  } catch (error: any) {
    console.log('save_warehouse', error);

    return error;
  }
}
