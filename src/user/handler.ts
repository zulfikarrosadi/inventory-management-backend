import { Request, Response } from 'express';
import ApiResponse from '../schema';
import { User } from './schema';
import { accessTokenMaxAge, refreshTokenMaxAge } from '../lib/token';

interface UserService {
  registerUser(data: User): Promise<{
    response: ApiResponse;
    token?: { accessToken: string; refreshToken: string };
  }>;
  getUserById(idFromUrlPath: string): Promise<{ response: ApiResponse }>;
}

class UserHandler {
  constructor(public service: UserService) {}

  registerUser = async (
    req: Request<{}, {}, User>,
    res: Response<ApiResponse>,
  ) => {
    const result = await this.service.registerUser({
      username: req.body.username,
      password: req.body.password,
    });
    if (result.response.status === 'fail') {
      return res.status(result.response.errors!.code).json(result.response);
    }

    return res
      .status(201)
      .cookie('accessToken', result.token!.accessToken, {
        secure: true,
        sameSite: 'none',
        httpOnly: true,
        maxAge: accessTokenMaxAge,
      })
      .cookie('refreshToken', result.token!.refreshToken, {
        secure: true,
        sameSite: 'none',
        httpOnly: true,
        path: '/api/refresh',
        maxAge: refreshTokenMaxAge,
      })
      .json(result.response);
  };

  getUserById = async (
    req: Request<{ id: string }>,
    res: Response<ApiResponse>,
  ) => {
    const result = await this.service.getUserById(req.params.id);
    if (result.response.status === 'fail') {
      return res.status(result.response.errors!.code).json(result.response);
    }

    return res.status(200).json(result.response);
  };

  getCurrentUser = async (
    req: Request,
    res: Response<ApiResponse, { user: { username: string; userId: number } }>,
  ) => {
    return res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: res.locals.user.userId,
          username: res.locals.user.username,
        },
      },
    });
  };
}

export default UserHandler;
