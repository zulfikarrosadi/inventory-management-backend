import { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { CreateWarehouse, UpdateWarehouse, Warehouse } from './schema';
import { NotFoundError } from '../lib/Error';
import { Stock } from '../inventory/schema';

type StockFromWarehouse = Array<
  | {
      warehouse_id: number;
      warehouse_name: string;
      warehouse_address: string;
    } & Stock
>;

class WarehouseRepository {
  constructor(private db: Pool) {}

  async saveWarehouse(data: CreateWarehouse, userId: number) {
    const [rows] = await this.db.execute(
      'INSERT INTO warehouses (name, address, user_id) VALUES (?, ?, ?)',
      [data.name, data.address, userId],
    );
    if (!rows) {
      console.log('save warehouse error', rows);
      throw new Error('something went wrong, please try again');
    }
    const result = rows as ResultSetHeader;
    return { warehouseId: result.insertId };
  }

  async findWarehouseById(warehouseId: number, userId: number) {
    const [rows] = await this.db.query<RowDataPacket[]>(
      'SELECT id, name, address, user_id from warehouses where id = ? AND user_id = ?',
      [warehouseId, userId],
    );

    if (!rows) {
      throw new NotFoundError(
        'no warehouse found, enter correct info and try again',
      );
    }
    return rows[0] as unknown as Warehouse;
  }

  async findWarehouses(userId: number) {
    const [rows] = await this.db.query<RowDataPacket[]>(
      'SELECT warehouses.id, warehouses.name, warehouses.address FROM warehouses JOIN users ON warehouses.user_id = users.id WHERE users.id = ? LIMIT 50',
      [userId],
    );
    if (!rows.length) {
      throw new NotFoundError(
        'no warehouse found, create new warehouse to start',
      );
    }

    return rows as unknown as Warehouse[];
  }

  async updateWarehouseById(
    warehouseId: number,
    userId: number,
    data: UpdateWarehouse,
  ) {
    const [rows] = await this.db.execute(
      'UPDATE warehouses SET name = ?, address = ? WHERE id = ? AND user_id = ?',
      [data.name, data.address, warehouseId, userId],
    );
    const result = rows as ResultSetHeader;
    if (!result) {
      console.log('update warehouse by id error', result);
      throw new Error(
        'something went wrong, enter correct data and please try again',
      );
    }
    return { affectedRows: result.affectedRows };
  }

  async findStockFromWarehouse(warehouseId: number, userId: number) {
    const [rows] = await this.db.query<RowDataPacket[]>(
      `SELECT warehouses.id AS warehouse_id, warehouses.name AS warehouse_name, warehouses.address AS warehouse_address, stocks.id, stocks.name, stocks.supplier, stocks.quantity, stocks.cost_price, stocks.purchase_date, stocks.stock_due_date, stocks.created_at, stocks.updated_at FROM warehouses JOIN stocks ON stocks.warehouse_id = warehouses.id WHERE warehouses.id = ? AND warehouses.user_id = ?`,
      [warehouseId, userId],
    );
    if (!rows.length) {
      throw new NotFoundError('this warehouse is empty');
    }
    return rows as unknown as Stock[];
  }

  async deleteWarehouseById(warehouseId: number, userId: number) {
    const [rows] = await this.db.execute(
      'DELETE FROM warehouses WHERE id = ? AND user_id = ?',
      [warehouseId, userId],
    );

    const result = rows as ResultSetHeader;
    if (result.affectedRows === 0) {
      throw new Error(
        'fail to delete this warehouse, please enter the correct information and try again',
      );
    }

    return { affectedRows: result.affectedRows };
  }

  async findStocksFromAllWarehouses(
    userId: number,
  ): Promise<StockFromWarehouse> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      'SELECT warehouses.id AS warehouse_id, warehouses.name AS warehouse_name, warehouses.address AS warehouse_address, stocks.id, stocks.name, stocks.supplier, stocks.quantity, stocks.cost_price, stocks.purchase_date, stocks.stock_due_date, stocks.created_at, stocks.updated_at FROM warehouses JOIN stocks ON stocks.warehouse_id = warehouses.id WHERE warehouses.user_id = ?',
      [userId],
    );
    if (!rows.length) {
      throw new Error('no warehouse and stocks found');
    }
    const result = rows as unknown as StockFromWarehouse;
    return result;
  }
}

export default WarehouseRepository;
