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

export async function findStocksFromWarehouse(warehouse_id: number) {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT stocks.id, stocks.name, stocks.supplier, stocks.quantity, stocks.cost_price, stocks.purchase_date, stocks.stock_due_date, stocks.created_at, stocks.updated_at FROM warehouses JOIN stocks ON stocks.warehouse_id = warehouses.id WHERE warehouses.id = ?`,
      [warehouse_id],
    );
    if (!rows.length) {
      throw new Error('no stocks in this warehouse is found');
    }

    return rows;
  } catch (error: any) {
    console.log('find_stocks_from_warehouse', error);

    return error;
  }
}
