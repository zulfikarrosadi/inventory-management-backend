/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async (knex) => {
  return await knex.schema.alterTable("users", (table) => {
    table.dropForeign("org_id");
    table.dropColumn("org_id");
    table.renameColumn("username", "email");
    table.unique("email");
    table.string("fullname");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async (knex) => {
  return await knex.schema.alterTable("users", (table) => {
    table
      .integer("org_id")
      .unsigned()
      .references("id")
      .inTable("organizations");
    table.dropUnique("email");
    table.renameColumn("email", "username");
    table.dropColumn("fullname");
  });
};
