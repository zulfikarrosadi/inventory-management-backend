import type { Pool, RowDataPacket } from "mysql2/promise";
import { AuthCredentialError } from "../lib/Error";

class AuthRepository {
  constructor(private db: Pool) { }

  async getUserByEmail(email: string) {
    const [rows] = await this.db.query<RowDataPacket[]>(
      "SELECT id, email, password from users WHERE email = ?",
      [email],
    );

    if (!rows.length) {
      throw new AuthCredentialError();
    }

    return {
      id: rows[0].id,
      email: rows[0].email,
      password: rows[0].password,
    };
  }

  async saveTokenToDb(token: string, userId: number) {
    const [rows] = await this.db.execute(
      "UPDATE users SET refresh_token = ? WHERE id = ?",
      [token, userId],
    );

    return rows;
  }

  async getTokenByUserId(userId: number) {
    const [rows] = await this.db.query<RowDataPacket[]>(
      "SELECT refresh_token FROM users WHERE id = ?",
      [userId],
    );
    if (!rows.length) {
      throw new Error("token not found in database");
    }

    return rows[0].refresh_token as string;
  }
}

export default AuthRepository;
