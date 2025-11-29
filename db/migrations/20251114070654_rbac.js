/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async (knex) => {
  const isPermissionTableExists = await knex.schema.hasTable("permissions");
  if (!isPermissionTableExists) {
    await knex.schema.createTable("permissions", (table) => {
      table.increments("id").primary();
      table.string("slug").notNullable();
      table.string("description");
      table.bigInteger("created_at").notNullable();
      table.bigInteger("updated_at");
    });
  }

  const isRoleTableExists = await knex.schema.hasTable("roles");
  if (!isRoleTableExists) {
    await knex.schema.createTable("roles", (table) => {
      table.increments("id").primary();
      table.string("name").notNullable();
      table.string("description");
      table
        .integer("org_id")
        .unsigned()
        .references("id")
        .inTable("organizations");
      table.unique(["org_id", "name"]);
    });
  }

  const isRolePermissionTableExists =
    await knex.schema.hasTable("role_permissions");
  if (!isRolePermissionTableExists) {
    await knex.schema.createTable("role_permissions", (table) => {
      table.integer("role_id").unsigned().references("id").inTable("roles");
      table
        .integer("permission_id")
        .unsigned()
        .references("id")
        .inTable("permissions");
      table.primary(["role_id", "permission_id"]);
    });
  }

  const isUserRoleTableExists = await knex.schema.hasTable("user_roles");
  if (!isUserRoleTableExists) {
    return await knex.schema.createTable("user_roles", (table) => {
      table.integer("user_id").references("id").inTable("users");
      table.integer("role_id").unsigned().references("id").inTable("roles");
      table.integer("warehouse_id").references("id").inTable("warehouses");
      table.primary(["user_id", "role_id", "warehouse_id"]);
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = (knex) => {
  return knex.schema
    .dropTableIfExists("user_roles")
    .dropTableIfExists("role_permissions")
    .dropTableIfExists("roles")
    .dropTableIfExists("permissions");
};

const user = {
  user: {
    email: "",
    org_id: 1,
    roles: [
      {
        id: 1,
        name: "manager",
        permissions: ["inventory:transfer"],
        allowed_warehouse: [1, 2],
      },
      {
        id: 2,
        name: "viewer",
        permission_id: [1],
        allowed_warehouse: [3],
      },
    ],
  },
};
