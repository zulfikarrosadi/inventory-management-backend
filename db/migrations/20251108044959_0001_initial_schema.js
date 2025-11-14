/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = (knex) =>
  knex.raw(`
DROP TABLE IF EXISTS \`users\`;
CREATE TABLE \`users\` (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`username\` varchar(255) NOT NULL,
  \`password\` varchar(255) NOT NULL,
  \`refresh_token\` varchar(5000) DEFAULT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS \`warehouses\`;
CREATE TABLE \`warehouses\` (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`name\` varchar(255) NOT NULL,
  \`address\` varchar(1000) NOT NULL,
  \`user_id\` int(11) NOT NULL,
  PRIMARY KEY (\`id\`),
  KEY \`user_id\` (\`user_id\`),
  CONSTRAINT \`warehouses_ibfk_1\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`)
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS \`stocks\`;
CREATE TABLE \`stocks\` (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`name\` varchar(255) NOT NULL,
  \`supplier\` varchar(500) NOT NULL,
  \`quantity\` int(11) NOT NULL,
  \`cost_price\` int(11) NOT NULL,
  \`purchase_date\` bigint(20) NOT NULL,
  \`stock_due_date\` bigint(20) NOT NULL,
  \`created_at\` bigint(20) NOT NULL,
  \`updated_at\` bigint(20) DEFAULT NULL,
  \`warehouse_id\` int(11) NOT NULL,
  PRIMARY KEY (\`id\`),
  KEY \`warehouse_id\` (\`warehouse_id\`),
  CONSTRAINT \`stocks_ibfk_1\` FOREIGN KEY (\`warehouse_id\`) REFERENCES \`warehouses\` (\`id\`)
) ENGINE=InnoDB AUTO_INCREMENT=106 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

`);

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = (knex) =>
  knex.raw(`
    DROP TABLE IF EXISTS \`warehouses\`;
    DROP TABLE IF EXISTS \`stocks\`;
    DROP TABLE IF EXISTS \`users\`;
`);
