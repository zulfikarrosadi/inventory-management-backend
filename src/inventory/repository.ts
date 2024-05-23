import { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from '../db';
import { CreateStock, Stock, UpdateStock } from './schema';

export async function saveStock(
  data: CreateStock,
): Promise<ResultSetHeader | Error> {
  try {
    const [rows] = await pool.execute(
      'INSERT INTO stocks (name, total) VALUES (?,?)',
      [data.name, data.total],
    );
    return rows as ResultSetHeader;
  } catch (error: any) {
    console.log(error);
    return error;
  }
}

export async function findStocks(): Promise<RowDataPacket[] | Error> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, name, total, created_at, updated_at FROM stocks LIMIT 50',
    );
    if (!rows.length) {
      throw new Error('inventory is empty');
    }

    return rows;
  } catch (error: any) {
    console.log(error);

    return error;
  }
}

export async function findStockById(id: number): Promise<Stock | Error> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, name, total, created_at, updated_at FROM stocks WHERE id = ?',
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
      'UPDATE stocks SET name = ?, total = ?, updated_at = ? WHERE id = ?',
      [data.name, data.total, data.updated_at, id],
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
