import ApiResponse from '../schema';
import { Login } from './schema';
import { Auth } from '../lib/Auth';
import { AuthCredentialError } from '../lib/Error';
import { RowDataPacket } from 'mysql2';

interface User {
  id: number;
  username: string;
  password: string;
}

interface AuthRepository {
  getUserByUsername(username: string): Promise<User>;
  saveTokenToDb(token: string, userId: number): Promise<any>;
  getTokenByUserId(userId: number): Promise<string>;
}

class AuthService extends Auth {
  constructor(public repository: AuthRepository) {
    super();
  }

  async login(data: Login): Promise<{
    response: ApiResponse;
    token?: { accessToken: string; refreshToken: string };
  }> {
    try {
      const user = await this.repository.getUserByUsername(data.username);
      const isPasswordMatch = await this.verifyPassword(
        data.password,
        user.password,
      );
      if (!isPasswordMatch) {
        throw new AuthCredentialError();
      }

      const accessToken = this.createAccessToken({
        username: user.username,
        userId: user.id,
      });
      const refreshToken = this.createRefreshToken({
        username: user.username,
        userId: user.id,
      });

      return {
        response: {
          status: 'success',
          data: {
            user: {
              id: user.id,
              username: user.username,
            },
          },
        },
        token: { accessToken, refreshToken },
      };
    } catch (error: any) {
      if (error.code && error.code === 'ECONNREFUSED') {
        return {
          response: {
            status: 'fail',
            errors: {
              code: 500,
              message:
                'this is not your fault, something went wrong in our system, please try again later',
            },
          },
        };
      }
      return {
        response: {
          status: 'fail',
          errors: { code: 400, message: error.message },
        },
      };
    }
  }

  async refreshToken(
    token: string,
  ): Promise<{ response: ApiResponse; token?: string }> {
    try {
      const { decodedData } = this.verifyToken(token);

      if (!decodedData) {
        throw new Error('invalid refresh token');
      }
      const tokenFromDb = await this.repository.getTokenByUserId(
        decodedData.userId,
      );
      if (token !== tokenFromDb) {
        throw new Error('invalid refresh token');
      }
      const newAccessToken = this.createAccessToken({
        username: decodedData.username,
        userId: decodedData.userId,
      });
      return {
        response: {
          status: 'success',
          data: {
            user: {
              id: decodedData.userId,
              username: decodedData.username,
            },
          },
        },
        token: newAccessToken,
      };
    } catch (error: any) {
      return {
        response: {
          status: 'fail',
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
