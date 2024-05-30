import { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from '../db';
import { CreateStock, Stock, UpdateStock } from './schema';

export async function saveStock(
  data: CreateStock,
): Promise<ResultSetHeader | Error> {
  try {
    const [rows] = await pool.execute(
      'INSERT INTO stocks (name, supplier, quantity, cost_price, purchase_date, stock_due_date, created_at, warehouse_id) VALUES (?,?,?,?,?,?,?,?)',
      [
        data.name,
        data.supplier,
        data.quantity,
        data.cost_price,
        data.purchase_date,
        data.stock_due_date,
        data.created_at,
        data.warehouse_id,
      ],
    );
    return rows as ResultSetHeader;
  } catch (error: any) {
    console.log(error);
    return error;
  }
}

export async function findStockById(id: number): Promise<Stock | Error> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, name, supplier, quantity, cost_price, purchase_date, stock_due_date, created_at, updated_at FROM stocks WHERE id = ?',
      [id],
    );
    if (rows.length < 1) {
      throw new Error('stock not found, enter the correct id and try again');
    }

    return rows[0] as unknown as Stock;
  } catch (error: any) {
    return error;
  }
}

export async function updateStockById(
  id: number,
  data: UpdateStock,
): Promise<ResultSetHeader | Error> {
  try {
    const [rows] = await pool.execute(
      'UPDATE stocks SET name = ?, quantity = ?, cost_price = ?, purchase_date = ?, stock_due_date = ?, updated_at = ? WHERE id = ?',
      [
        data.name,
        data.quantity,
        data.cost_price,
        data.purchase_date,
        data.stock_due_date,
        data.updated_at,
        id,
      ],
    );
    const result = rows as ResultSetHeader;
    if (result.affectedRows === 0) {
      throw new Error(
        'updating stock failed, make sure you enter all column correctly and try again',
      );
    }
    return rows as ResultSetHeader;
  } catch (error: any) {
    return error;
  }
}

export async function deleteStockById(
  id: number,
): Promise<ResultSetHeader | Error> {
  try {
    const [rows] = await pool.execute('DELETE FROM stocks WHERE id = ?', [id]);
    const result = rows as ResultSetHeader;

    if (result.affectedRows === 0) {
      throw new Error(
        'failed to delete stock, enter the correct stock id and try again',
      );
    }
    return result;
  } catch (error: any) {
    return error;
  }
}
