import type { QueryResult } from "mysql2";
import { Auth } from "../lib/Auth";
import { AppError, AuthCredentialError } from "../lib/Error";
import type ApiResponse from "../schema";
import type { Login, LoginResult } from "./schema";

interface User {
  id: number;
  email: string;
  password: string;
}

interface AuthRepository {
  getUserByEmail(email: string): Promise<User>;
  saveTokenToDb(token: string, userId: number): Promise<QueryResult>;
  getTokenByUserId(userId: number): Promise<string>;
}

class AuthService extends Auth {
  constructor(public repository: AuthRepository) {
    super();
  }

  async login(data: Login): Promise<{
    response: ApiResponse<LoginResult>;
    token?: { accessToken: string; refreshToken: string };
  }> {
    try {
      const user = await this.repository.getUserByEmail(data.email);
      const isPasswordMatch = await this.verifyPassword(
        data.password,
        user.password,
      );
      if (!isPasswordMatch) {
        throw new AuthCredentialError();
      }

      const accessToken = this.createAccessToken({
        email: user.email,
        userId: user.id,
      });
      const refreshToken = this.createRefreshToken({
        email: user.email,
        userId: user.id,
      });
      await this.repository.saveTokenToDb(refreshToken, user.id);

      return {
        response: {
          status: "success",
          data: {
            user: {
              id: user.id,
              email: user.email,
            },
          },
        },
        token: { accessToken, refreshToken },
      };
    } catch (error: unknown) {
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "ECONNREFUSED"
      ) {
        return {
          response: {
            status: "fail",
            errors: {
              code: 500,
              message:
                "this is not your fault, something went wrong in our system, please try again later",
            },
          },
        };
      }
      if (error instanceof AppError) {
        return {
          response: {
            status: "fail",
            errors: { code: error.code, message: error.message },
          },
        };
      }
      return {
        response: {
          status: "fail",
          errors: {
            code: 500,
            message: "Something went wrong, please try again later",
          },
        },
      };
    }
  }

  async refreshToken(
    token: string,
  ): Promise<{ response: ApiResponse<LoginResult>; token?: string }> {
    try {
      const { decodedData } = this.verifyToken(token);

      if (!decodedData) {
        throw new Error("invalid refresh token");
      }
      const tokenFromDb = await this.repository.getTokenByUserId(
        decodedData.userId,
      );
      if (token !== tokenFromDb) {
        throw new Error("invalid refresh token");
      }
      const newAccessToken = this.createAccessToken({
        email: decodedData.email,
        userId: decodedData.userId,
      });
      return {
        response: {
          status: "success",
          data: {
            user: {
              id: decodedData.userId,
              email: decodedData.email,
            },
          },
        },
        token: newAccessToken,
      };
    } catch (error: any) {
      return {
        response: {
          status: "fail",
          errors: {
            code: 400,
            message: error.message || error,
          },
        },
      };
    }
  }
}

export default AuthService;
