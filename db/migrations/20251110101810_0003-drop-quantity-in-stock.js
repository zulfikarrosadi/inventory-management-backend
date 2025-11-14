/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = (knex) =>
  knex.schema.alterTable("stocks", (table) => {
    table.dropColumn("quantity");
  });

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = (knex) =>
  knex.schema.alterTable("stocks", (table) => {
    table.integer("quantity").notNullable().defaultTo(0);
  });
