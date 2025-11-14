/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = (knex) =>
  knex.schema.createTable("stock_movements", (table) => {
    table.increments("id").primary();
    table
      .integer("stock_id")
      .references("id")
      .inTable("stocks")
      .onDelete("CASCADE");
    table
      .integer("warehouse_id")
      .references("id")
      .inTable("warehouses")
      .onDelete("CASCADE");
    table
      .integer("user_id")
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table.integer("quantity_changes").notNullable();
    table.bigint("created_at").notNullable();
    table
      .enu("action", ["stock_in", "dispatch", "transfer", "adjustment"])
      .notNullable();
  });

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = (knex) => knex.schema.dropTableIfExists("stock_movements");
