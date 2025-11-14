import type { Pool, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { getContext } from "../lib/asyncLocalStorage";
import {
  AppError,
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "../lib/Error";
import type { Logger } from "../lib/logger";
import type { CreateOrg, FindByIdResult, UpdateOrg } from "./schema";

class OrgRepository {
  constructor(
    private db: Pool,
    public logger: Logger,
  ) { }

  /**
   * A private helper to translate generic DB errors into specific AppErrors.
   */
  private handleDbError(error: unknown): never {
    if (error && typeof error === "object" && "code" in error) {
      const dbError = error as { code: string; message: string };

      if (dbError.code === "ER_NO_REFERENCED_ROW_2") {
        throw new NotFoundError(
          "A related record (user or organization) was not found.",
        );
      }

      if (dbError.code === "ER_DUP_ENTRY") {
        throw new ConflictError("This action would create a duplicate record.");
      }

      if (
        dbError.code === "ER_BAD_NULL_ERROR" ||
        dbError.code === "ER_DATA_TOO_LONG"
      ) {
        throw new BadRequestError(`Invalid data: ${dbError.message}`);
      }
    }

    if (error instanceof AppError) {
      throw error;
    }

    if (error instanceof Error) {
      throw new Error(`Database error: ${error.message}`);
    }

    throw new Error(`An unknown database error occurred: ${String(error)}`);
  }

  async create(userId: number, data: CreateOrg) {
    const conn = await this.db.getConnection();
    try {
      await conn.beginTransaction();
      const [rows] = await conn.execute(
        `
        INSERT INTO organizations
        (name, address)
        VALUES (?,?)
      `,
        [data.name, data.address],
      );

      const orgResult = rows as ResultSetHeader;
      await conn.execute(
        `
        UPDATE users SET org_id = ? WHERE id = ?
        `,
        [orgResult.insertId, userId],
      );
      await conn.commit();

      return orgResult;
    } catch (error) {
      await conn.rollback();
      const context = getContext();

      this.logger("warn", "create organization in db failed", context, error);
      this.handleDbError(error);
    } finally {
      conn.release();
    }
  }

  async findById(id: number) {
    try {
      const [rows] = await this.db.query<RowDataPacket[]>(
        `
        SELECT
          id,
          name,
          address,
          version
        FROM
          organizations
        WHERE
          id = ?
        `,
        [id],
      );
      if (!rows.length) {
        throw new NotFoundError("organization is not found");
      }

      return rows[0] as FindByIdResult;
    } catch (error: unknown) {
      const context = getContext();
      this.logger("warn", "failed to get org by id", context, error);

      this.handleDbError(error);
    }
  }

  async updateById(id: number, version: number, data: UpdateOrg) {
    try {
      const [rows] = await this.db.execute(
        `
        UPDATE organizations
        SET
          name = ?,
          address = ?,
          version = ?
        WHERE
          id = ?
        AND
          version = ?
        `,
        [data.name, data.address, version + 1, id, version],
      );
      const orgResult = rows as ResultSetHeader;
      if (!orgResult.affectedRows) {
        throw new ConflictError(
          "this organization is already update while you send the request",
        );
      }

      return orgResult;
    } catch (error) {
      const context = getContext();

      this.logger("warn", "update organization in db failed", context, error);
      this.handleDbError(error);
    }
  }

  async deleteById(id: number) {
    try {
      const [rows] = await this.db.execute(
        `DELETE FROM organizations WHERE id = ?`,
        [id],
      );
      const result = rows as ResultSetHeader;
      if (result.affectedRows) {
        throw new NotFoundError(
          "failed to delete organization, organization not found",
        );
      }

      return result;
    } catch (error) {
      const context = getContext();
      this.logger("warn", "failed to delete org by id", context, error);
      this.handleDbError(error);
    }
  }
}

export default OrgRepository;
