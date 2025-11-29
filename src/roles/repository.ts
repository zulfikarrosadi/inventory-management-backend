import type { Pool, ResultSetHeader } from "mysql2/promise";
import { getContext } from "../lib/asyncLocalStorage";
import {
  AppError,
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "../lib/Error";
import type { Logger } from "../lib/logger";
import type {
  AddRoleUser,
  AddRoleUserResult,
  CreateRole,
  CreateRoleResult,
  DeleteUserRole,
  UpdateUserRole,
  UpdateUserRoleResult,
} from "./schema";

type QueryCreateRole = {
  role_id: number;
  role_name: string;
  role_description: string;
  role_permission_slug: string;
  role_permission_id: number;
};

type QueryGetUserIds = {
  id: number;
};

type QueryRole = {
  id: number;
  name: string;
  description: string;
};

const ER_NO_REFERENCED_ROW_2 = "ER_NO_REFERENCED_ROW_2";
const ER_DUP_ENTRY = "ER_DUP_ENTRY";

class RoleRepository {
  constructor(
    private db: Pool,
    private logger: Logger,
  ) { }

  async create(data: CreateRole): Promise<CreateRoleResult> {
    const conn = await this.db.getConnection();

    try {
      await conn.beginTransaction();

      const createRoleSql =
        "INSERT INTO roles (name, description, org_id) VALUES (?,?,?)";
      const createRole = await conn.execute(createRoleSql, [
        data.role_name,
        data.role_description,
        data.org_id,
      ]);
      const createRoleResult = createRole[0] as unknown as ResultSetHeader;

      const placeholders = data.permission_id.map(() => "(?, ?)").join(", ");
      const createRolePermissionSql = `INSERT INTO role_permissions (role_id, permission_id) VALUES ${placeholders}`;
      const createRolePermissionValues = data.permission_id.flatMap(
        (permissionId) => [createRoleResult.insertId, permissionId],
      );
      await conn.execute(createRolePermissionSql, createRolePermissionValues);

      const rolePermission = await conn.query(
        `
         select
           r.id as role_id,
           r.name as role_name,
           r.description as role_description,
           p.slug as role_permission_slug,
           p.id as role_permission_id
         from
           role_permissions rp
         join roles r on
           r.id = rp.role_id
         join permissions p on
           p.id = rp.permission_id
         where
           r.id = ?
        `,
        [createRoleResult.insertId],
      );
      const rolePermissionResult =
        rolePermission[0] as unknown as QueryCreateRole[];

      await conn.commit();

      return {
        name: rolePermissionResult[0].role_name,
        id: rolePermissionResult[0].role_id,
        description: rolePermissionResult[0].role_description,
        permission: rolePermissionResult.map((v) => ({
          id: v.role_permission_id,
          slug: v.role_permission_slug,
        })),
      };
    } catch (error: unknown) {
      await conn.rollback();
      const ctx = getContext();
      this.logger("error", "failed to create new role", ctx, error);

      if (error && typeof error === "object" && "code" in error) {
        const dbError = error as { code: string; message: string };
        if (dbError.code === ER_NO_REFERENCED_ROW_2) {
          throw new NotFoundError(
            "A related record (permission, org_id) was not found.",
          );
        }

        if (dbError.code === ER_DUP_ENTRY) {
          throw new ConflictError(
            "This action would create a duplicate record.",
          );
        }
      }
      throw new Error("Something went wrong, please try again later");
    } finally {
      conn.release();
    }
  }

  async addRoleToUsers(data: AddRoleUser): Promise<AddRoleUserResult> {
    const conn = await this.db.getConnection();
    try {
      await conn.beginTransaction();

      const role = await conn.query(
        "SELECT id, name, description FROM roles WHERE id = ?",
        data.role_id,
      );
      const roleResult = role[0] as unknown as QueryRole[];
      if (!roleResult.length) {
        throw new NotFoundError("Role is not found");
      }

      const getUserIdsplaceholder = data.email
        .map((_: string) => "?")
        .join(", ");
      const getUserIdsSql = `SELECT id FROM users WHERE email IN (${getUserIdsplaceholder})`;

      const getUserIds = await conn.query(getUserIdsSql, data.email);
      const getUserIdsResult = getUserIds[0] as unknown as QueryGetUserIds[];
      if (getUserIdsResult.length !== data.email.length) {
        throw new NotFoundError(
          "Some email is not found, enter correct email address(es)",
        );
      }

      const addRolePlaceholder = getUserIdsResult
        .map((_) => "(?,?,?)")
        .join(",");
      const queryValue = getUserIdsResult.flatMap((user) => [
        roleResult[0].id,
        user.id,
        data.warehouse_id,
      ]);
      const addRoleSql = `INSERT INTO user_roles (role_id, user_id, warehouse_id) VALUES ${addRolePlaceholder}`;
      await conn.execute(addRoleSql, queryValue);

      await conn.commit();

      return {
        id: getUserIdsResult.map((v) => v.id),
        role_id: roleResult[0].id,
        role_name: roleResult[0].name,
        role_description: roleResult[0].description,
        warehouse_id: data.warehouse_id,
      };
    } catch (error: unknown) {
      const ctx = getContext();
      this.logger("error", "failed to role to user(s)", ctx, error);

      if (error instanceof AppError) {
        throw error;
      }
      if (error && typeof error === "object" && "code" in error) {
        if (error.code === ER_NO_REFERENCED_ROW_2) {
          throw new NotFoundError(
            "Related field (role id, user email, warehouse id) is not found",
          );
        } else if (error.code === ER_DUP_ENTRY) {
          throw new ConflictError("Some user already have this role");
        }
      }
      throw new Error("Something went wrong please try again later");
    } finally {
      conn.release();
    }
  }

  async updateUserRole(data: UpdateUserRole): Promise<UpdateUserRoleResult> {
    try {
      const role = await this.db.query(
        "SELECT id, name, description FROM roles WHERE id = ?",
        data.new_role_id,
      );
      const roleResult = role[0] as unknown as QueryRole[];
      console.log("get role result update", roleResult);

      if (!roleResult.length) {
        throw new NotFoundError("Role is not found");
      }

      const getUserIdSql = `SELECT id FROM users WHERE email = ? LIMIT 1`;
      const getUserId = await this.db.query(getUserIdSql, data.email);
      const getUserIdResult = getUserId[0] as unknown as QueryGetUserIds[];

      console.log("query user update role: ", getUserIdResult);

      if (!getUserIdResult.length) {
        throw new NotFoundError("Email not found, enter correct email address");
      }

      const [rows] = await this.db.execute(
        `UPDATE
          user_roles
        SET
          user_id = ?,
          role_id = ?,
          warehouse_id = ?
        WHERE
          user_id = ? AND
          role_id = ? AND
          warehouse_id = ?`,
        [
          getUserIdResult[0].id,
          roleResult[0].id,
          data.warehouse_id,
          getUserIdResult[0].id,
          data.prev_role_id,
          data.warehouse_id,
        ],
      );
      const updateResult = rows as unknown as ResultSetHeader;
      if (!updateResult.affectedRows) {
        throw new BadRequestError(
          "Fail to update user role, insert correct data and try again later",
        );
      }

      return {
        id: getUserIdResult[0].id,
        role_id: roleResult[0].id,
        role_name: roleResult[0].name,
        role_description: roleResult[0].description,
        warehouse_id: data.warehouse_id,
      };
    } catch (error: unknown) {
      const ctx = getContext();
      this.logger("error", "fail to update user role", ctx, error);

      if (error instanceof AppError) {
        throw error;
      }
      throw new Error("Something went wrong, please try again later");
    }
  }

  async deleteUserRole(data: DeleteUserRole) {
    try {
      const userId = await this.db.query(
        "SELECT id FROM users WHERE email = ?",
        [data.email],
      );
      const userIdResult = userId[0] as unknown as QueryGetUserIds[];

      const [rows] = await this.db.execute(
        `
        DELETE FROM
          user_roles
        WHERE
          user_id = ? AND
          role_id = ? AND
          warehouse_id = ?
        `,
        [userIdResult[0].id, data.role_id, data.warehouse_id],
      );
      const deleteResult = rows as unknown as ResultSetHeader;

      if (!deleteResult.affectedRows) {
        throw new NotFoundError("Fail to delete user role, record not found");
      }
      return;
    } catch (error: unknown) {
      const ctx = getContext();
      this.logger("error", "fail to delete user role", ctx, error);

      if (error instanceof AppError) {
        throw error;
      }
      throw new Error("Something went wrong, please try again later");
    }
  }
}

export default RoleRepository;
