/**
 * @typedef {Object} Permission
 * @property {string} slug
 * @property {string} description
 * @property {bigint} created_at
 * @property {bigint | null} updated_at
 */

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex("permissions").del();

  const created_at = new Date().getTime();

  /** @type{Permissions[]} */
  const permissions = [
    {
      slug: "warehouse:create",
      description: "Create new warehouse",
      created_at,
    },
    {
      slug: "warehouse:edit",
      description: "Edit warehouse details",
      created_at,
    },
    {
      slug: "warehouse:view",
      description: "View warehouse details",
      created_at,
    },
    {
      slug: "inventory:read",
      description: "View product details and stock level",
      created_at,
    },
    {
      slug: "inventory:create",
      description: "Create new product",
      created_at,
    },
    {
      slug: "inventory:edit",
      description: "Edit product details",
      created_at,
    },
    {
      slug: "inventory:adjustment",
      description:
        "Manually edit stock quantity (e.g caused by product damage or loss)",
      created_at,
    },
    {
      slug: "inventory:transfer",
      description: "Move stocks from warehouse to other source",
      created_at,
    },
    {
      slug: "users:manage",
      description: "Manage user access and roles",
      created_at,
    },
    {
      slug: "users:views",
      description: "Sees who is in the system",
      created_at,
    },
    {
      slug: "reports:view",
      description: "View analytics and reports",
      created_at,
    },
  ];

  await knex("permissions").insert(permissions);
};
