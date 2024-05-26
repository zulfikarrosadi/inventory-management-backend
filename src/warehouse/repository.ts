import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { CreateWarehouse, Warehouse } from './schema';
import pool from '../db';

export async function saveWarehouse(
  data: CreateWarehouse,
): Promise<ResultSetHeader | Error> {
  try {
    const [rows] = await pool.execute(
      'INSERT INTO warehouses (name, address) VALUES (?,?)',
      [data.name, data.address],
    );

    return rows as unknown as ResultSetHeader;
  } catch (error: any) {
    console.log('save_warehouse', error);

    return error;
  }
}

export async function findWarehouses(): Promise<Warehouse[] | Error> {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT id, name, address FROM warehouses LIMIT 50',
  );
  if (!rows.length) {
    throw new Error('no warehouse found, create new warehouse to start');
  }

  return rows as unknown as Warehouse[];
}
