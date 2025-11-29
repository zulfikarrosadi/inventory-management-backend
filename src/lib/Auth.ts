import { compare, hash } from "bcrypt";
import {
  accessTokenMaxAge,
  createNewToken,
  refreshTokenMaxAge,
  verifyToken,
} from "./token";

export class Auth {
  protected async verifyPassword(data: string | Buffer, encrypted: string) {
    return await compare(data, encrypted);
  }

  protected async hashPassword(password: string | Buffer) {
    return await hash(password, 10);
  }

  protected createAccessToken(data: { email: string; userId: number }) {
    return createNewToken({
      email: data.email,
      userId: data.userId,
      expiration: accessTokenMaxAge,
    });
  }

  protected createRefreshToken(data: { email: string; userId: number }) {
    return createNewToken({
      email: data.email,
      userId: data.userId,
      expiration: refreshTokenMaxAge,
    });
  }

  protected verifyToken(token: string) {
    return verifyToken(token);
  }
}
