import { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { User } from './schema';
import { UsernameAlreadyExistsError } from '../lib/Error';

class UserRepository {
  private USER_ALREADY_EXISTS = 1062;
  constructor(private db: Pool) {}

  async createUser(data: User) {
    try {
      const [rows] = await this.db.execute(
        'INSERT INTO users (username, password) VALUES (?, ?)',
        [data.username, data.password],
      );
      const result = rows as ResultSetHeader;

      return { userId: result.insertId };
    } catch (error: any) {
      if (error.errno === this.USER_ALREADY_EXISTS) {
        throw new UsernameAlreadyExistsError();
      }
      throw new Error(error);
    }
  }

  async getUserById(id: number): Promise<{ id: number; username: string }> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      'SELECT id, username FROM users WHERE id = ?',
      [id],
    );
    if (!rows.length) {
      throw new Error('user not found');
    }

    return {
      id: rows[0].id,
      username: rows[0].username,
    };
  }

  async saveTokenToDb(refreshToken: string, userId: number) {
    const [rows] = await this.db.execute(
      'UPDATE users SET refresh_token = ? WHERE id = ?',
      [refreshToken, userId],
    );
    const result = rows as ResultSetHeader;
    return { affectedRows: result.affectedRows };
  }
}

export default UserRepository;
