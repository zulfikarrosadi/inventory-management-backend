import { Pool, RowDataPacket } from 'mysql2/promise';
import { AuthCredentialError } from '../lib/Error';

class AuthRepository {
  constructor(private db: Pool) {}

  async getUserByUsername(username: string) {
    const [rows] = await this.db.query<RowDataPacket[]>(
      'SELECT id, username, password from users WHERE username = ?',
      [username],
    );

    if (!rows.length) {
      throw new AuthCredentialError();
    }

    return {
      id: rows[0].id,
      username: rows[0].username,
      password: rows[0].password,
    };
  }

  async saveTokenToDb(token: string, userId: number) {
    const [rows] = await this.db.execute(
      'UPDATE users SET refresh_token = ? WHERE id = ?',
      [token, userId],
    );

    return rows;
  }

  async getTokenByUserId(userId: number) {
    const [rows] = await this.db.query<RowDataPacket[]>(
      'SELECT refresh_token FROM users WHERE id = ?',
      [userId],
    );
    if (!rows.length) {
      throw new Error('token not found in database');
    }

    return rows[0]['refresh_token'] as string;
  }
}

export default AuthRepository;
