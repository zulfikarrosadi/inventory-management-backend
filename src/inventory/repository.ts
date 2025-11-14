import type { Pool, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { getContext } from "../lib/asyncLocalStorage";
import {
  AppError,
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "../lib/Error";
import type { Logger } from "../lib/logger";
import type {
  CreateStock,
  Stock,
  UpdateStock,
  UpdateStockQuantity,
} from "./schema";

class InventoryRepository {
  constructor(
    private db: Pool,
    private logger: Logger,
  ) { }

  /**
   * A private helper to translate generic DB errors into specific AppErrors.
   */
  private handleDbError(error: unknown): never {
    if (error && typeof error === "object" && "code" in error) {
      const dbError = error as { code: string; message: string };

      if (dbError.code === "ER_NO_REFERENCED_ROW_2") {
        // Foreign key constraint failed
        throw new NotFoundError(
          "A related record (stock, warehouse, or user) was not found.",
        );
      }

      if (dbError.code === "ER_DUP_ENTRY") {
        // Duplicate key
        throw new ConflictError("This action would create a duplicate record.");
      }

      if (
        dbError.code === "ER_BAD_NULL_ERROR" ||
        dbError.code === "ER_DATA_TOO_LONG"
      ) {
        // Bad data
        throw new BadRequestError(`Invalid data: ${dbError.message}`);
      }
    }

    // If it's already one of our custom errors, just re-throw it
    if (error instanceof AppError) {
      throw error;
    }

    // For all other unknown errors, throw a generic 500-level error
    // Also, ensure we're throwing an Error object
    if (error instanceof Error) {
      throw new Error(`Database error: ${error.message}`);
    }

    // Handle cases where the thrown object isn't even an Error
    throw new Error(`An unknown database error occurred: ${String(error)}`);
  }

  async saveStock(data: CreateStock) {
    try {
      const [rows] = await this.db.execute(
        "INSERT INTO stocks (name, supplier, cost_price, purchase_date, stock_due_date, created_at, warehouse_id) VALUES (?,?,?,?,?,?,?)",
        [
          data.name,
          data.supplier,
          data.cost_price,
          data.purchase_date,
          data.stock_due_date,
          data.created_at,
          data.warehouse_id,
        ],
      );
      return rows as ResultSetHeader;
    } catch (error: any) {
      const context = getContext();

      this.logger("error", error.message, context);
      this.handleDbError(error);
    }
  }

  async updateStockQuantity(data: UpdateStockQuantity, userId: number) {
    try {
      const [rows] = await this.db.execute(
        `
        INSERT INTO stock_movements
        (stock_id, warehouse_id, user_id, quantity_changes, action, created_at)
        VALUES(?,?,?,?,?,?)
      `,
        [
          data.stock_id,
          data.warehouse_id,
          userId,
          data.quantity_changes,
          data.action,
          data.created_at,
        ],
      );

      return rows;
    } catch (error: any) {
      const context = getContext();

      this.logger("error", error.message, context);
      this.handleDbError(error);
    }
  }

  async findStockById(id: number): Promise<Stock> {
    try {
      const [rows] = await this.db.query<RowDataPacket[]>(
        `
        SELECT
          s.id AS id,
          s.name AS name,
          s.supplier AS supplier,
          SUM(sm.quantity_changes) AS quantity,
          s.cost_price AS cost_price,
          s.purchase_date AS purchase_date,
          s.stock_due_date AS stock_due_date,
          s.created_at AS created_at,
          s.updated_at AS updated_at
        FROM stock_movements sm
        JOIN stocks s
          ON sm.stock_id = s.id
        WHERE s.id = ?
        GROUP BY sm.stock_id
      `,
        [id],
      );
      if (rows.length < 1) {
        throw new NotFoundError(
          "stock not found, enter the correct id and try again",
        );
      }

      return rows[0] as unknown as Stock;
    } catch (error: any) {
      const context = getContext();

      this.logger("error", error.message, context);
      this.handleDbError(error);
    }
  }

  async updateStockById(data: UpdateStock, id: number) {
    try {
      const [rows] = await this.db.execute(
        "UPDATE stocks SET name = ?, cost_price = ?, purchase_date = ?, stock_due_date = ?, updated_at = ? WHERE id = ?",
        [
          data.name,
          data.cost_price,
          data.purchase_date,
          data.stock_due_date,
          data.updated_at,
          id,
        ],
      );
      const result = rows as ResultSetHeader;
      if (result.affectedRows === 0) {
        throw new NotFoundError(
          "updating stock failed, make sure you enter all column correctly and try again",
        );
      }
      return rows as ResultSetHeader;
    } catch (error: any) {
      const context = getContext();

      this.logger("error", error.message, context);
      this.handleDbError(error);
    }
  }

  async deleteStockById(id: number) {
    try {
      const [rows] = await this.db.execute("DELETE FROM stocks WHERE id = ?", [
        id,
      ]);
      const result = rows as ResultSetHeader;

      if (result.affectedRows === 0) {
        throw new NotFoundError(
          "failed to delete stock, enter the correct stock id and try again",
        );
      }
      return result;
    } catch (error: any) {
      const context = getContext();

      this.logger("error", error.message, context);
      this.handleDbError(error);
    }
  }
}

export default InventoryRepository;
