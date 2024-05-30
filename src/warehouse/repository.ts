import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { CreateWarehouse, UpdateWarehouse, Warehouse } from './schema';
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

export async function updateWarehouseById(
  id: number,
  data: UpdateWarehouse,
): Promise<Warehouse | Error> {
  const [rows] = await pool.execute(
    'UPDATE warehouses SET name = ?, address = ? WHERE id = ?',
    [data.name, data.address, id],
  );
  const result = rows as ResultSetHeader & Warehouse;

  if (result.affectedRows === 0) {
    throw new Error(
      'failed to update warehouse, please enter correct data and try again',
    );
  }

  return result;
}

export async function findWarehouseById(id: number): Promise<Warehouse> {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT id, name, address FROM warehouses WHERE id = ?',
    [id],
  );
  if (!rows.length) {
    throw new Error(
      'warehouse not found, please enter the correct id and try again',
    );
  }

  return rows[0] as unknown as Warehouse;
}
