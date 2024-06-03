import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { CreateWarehouse, UpdateWarehouse, Warehouse } from './schema';
import pool from '../db';

export async function saveWarehouse(
  data: CreateWarehouse,
  userId: number,
): Promise<ResultSetHeader | Error> {
  try {
    const [rows] = await pool.execute(
      'INSERT INTO warehouses (name, address, user_id) VALUES (?,?,?)',
      [data.name, data.address, userId],
    );

    return rows as unknown as ResultSetHeader;
  } catch (error: any) {
    console.log('save_warehouse', error);

    return error;
  }
}

export async function findWarehouses(
  userId: number,
): Promise<Warehouse[] | Error> {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT warehouses.id, warehouses.name, warehouses.address FROM warehouses JOIN users ON warehouses.user_id = users.id WHERE users.id = ? LIMIT 50',
    [userId],
  );
  if (!rows.length) {
    throw new Error('no warehouse found, create new warehouse to start');
  }

  return rows as unknown as Warehouse[];
}

export async function updateWarehouseById(
  id: number,
  userId: number,
  data: UpdateWarehouse,
): Promise<ResultSetHeader | Error> {
  const [rows] = await pool.execute(
    'UPDATE warehouses SET name = ?, address = ? WHERE id = ? AND user_id = ?',
    [data.name, data.address, id, userId],
  );
  const result = rows as ResultSetHeader;

  if (result.affectedRows === 0) {
    throw new Error(
      'failed to update warehouse, please enter correct data and try again',
    );
  }

  return result;
}

export async function findWarehouseById(
  id: number,
  userId: number,
): Promise<Warehouse> {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT id, name, address FROM warehouses WHERE id = ? AND user_id = ?',
    [id, userId],
  );
  if (!rows.length) {
    throw new Error(
      'warehouse not found, please enter the correct id and try again',
    );
  }

  return rows[0] as unknown as Warehouse;
}

export async function findStocksFromWarehouse(
  warehouse_id: number,
  userId: number,
) {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT warehouses.id AS warehouse_id, warehouses.name AS warehouse_name, warehouses.address AS warehouse_address, stocks.id, stocks.name, stocks.supplier, stocks.quantity, stocks.cost_price, stocks.purchase_date, stocks.stock_due_date, stocks.created_at, stocks.updated_at FROM warehouses JOIN stocks ON stocks.warehouse_id = warehouses.id WHERE warehouses.id = ? AND warehouses.user_id = ?`,
    [warehouse_id, userId],
  );
  if (!rows.length) {
    throw new Error('no stocks in this warehouse is found');
  }

  return rows;
}

export async function deleteWarehouseById(id: number, userId: number) {
  const [rows] = await pool.execute(
    'DELETE FROM warehouses WHERE id = ? AND user_id = ?',
    [id, userId],
  );
  const result = rows as ResultSetHeader;

  if (result.affectedRows === 0) {
    throw new Error('delete fail, enter the correct id and try again');
  }
  return true;
}

export async function findStocksFromAllWarehouses(userId: number) {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT warehouses.id AS warehouse_id, warehouses.name AS warehouse_name, warehouses.address AS warehouse_address, stocks.id, stocks.name, stocks.supplier, stocks.quantity, stocks.cost_price, stocks.purchase_date, stocks.stock_due_date, stocks.created_at, stocks.updated_at FROM warehouses JOIN stocks ON stocks.warehouse_id = warehouses.id WHERE warehouses.user_id = ?',
    [userId],
  );
  if (!rows.length) {
    throw new Error('no warehouse and stocks found');
  }
  console.log(JSON.stringify(rows));
  return rows;
}
