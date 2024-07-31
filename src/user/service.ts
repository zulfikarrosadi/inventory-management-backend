import { Auth } from '../lib/Auth';
import ApiResponse from '../schema';
import { User } from './schema';

interface UserRepository {
  createUser(data: User): Promise<{ userId: number }>;
  getUserById(id: number): Promise<{ id: number; username: string }>;
  saveTokenToDb(
    refreshToken: string,
    userId: number,
  ): Promise<{ affectedRows: number }>;
}

class UserSerivce extends Auth {
  constructor(public repo: UserRepository) {
    super();
  }

  public registerUser = async (
    data: User,
  ): Promise<{
    response: ApiResponse;
    token?: { accessToken: string; refreshToken: string };
  }> => {
    try {
      const newUser = await this.repo.createUser({
        username: data.username,
        password: await this.hashPassword(data.password),
      });
      const user = await this.repo.getUserById(newUser.userId);
      const accessToken = this.createAccessToken({
        username: user.username,
        userId: newUser.userId,
      });
      const refreshToken = this.createRefreshToken({
        username: user.username,
        userId: newUser.userId,
      });
      await this.repo.saveTokenToDb(refreshToken, newUser.userId);
      return {
        response: {
          status: 'success',
          data: { user: { id: newUser.userId, username: user.username } },
        },
        token: { accessToken, refreshToken },
      };
    } catch (error: any) {
      return {
        response: {
          status: 'fail',
          errors: {
            code: 400,
            message: error.message,
          },
        },
      };
    }
  };

  public getUserById = async (
    idFromUrlPath: string,
  ): Promise<{ response: ApiResponse }> => {
    try {
      const id = parseInt(idFromUrlPath, 10);
      if (Number.isNaN(id)) {
        throw new Error('user not found');
      }
      const user = await this.repo.getUserById(id);
      return {
        response: {
          status: 'success',
          data: { user: { id, username: user.username } },
        },
      };
    } catch (error: any) {
      return {
        response: {
          status: 'fail',
          errors: { code: 404, message: error.message || error },
        },
      };
    }
  };
}

export default UserSerivce;
