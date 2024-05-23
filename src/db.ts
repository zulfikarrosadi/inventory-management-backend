import { createPool } from 'mysql2/promise';
import 'dotenv/config';

const connection = createPool({
  database: 'inventory_system',
  user: 'root',
  password: '',
  host: 'localhost',
  port: 3306,
});

export default connection;
