/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = (knex) =>
  knex.schema.alterTable("users", (table) => {
    table
      .integer("org_id")
      .unsigned()
      .references("id")
      .inTable("organizations")
      .onUpdate("cascade");
  });

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = (knex) =>
  knex.schema.alterTable("users", (table) => {
    table.dropColumn("org_id");
  });
