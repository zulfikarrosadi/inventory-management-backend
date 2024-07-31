import { Request, Response } from 'express';
import ApiResponse from '../schema';
import { Login } from './schema';
import { accessTokenMaxAge, refreshTokenMaxAge } from '../lib/token';

interface AuthService {
  login(data: Login): Promise<{
    response: ApiResponse;
    token?: { accessToken: string; refreshToken: string };
  }>;
  refreshToken(token: string): Promise<{
    response: ApiResponse;
    token?: string;
  }>;
}

class AuthHandler {
  constructor(private service: AuthService) {}

  login = async (
    req: Request<{}, {}, { username: string; password: string }>,
    res: Response,
  ) => {
    const { response, token } = await this.service.login({
      username: req.body.username,
      password: req.body.password,
    });
    if (response.status === 'fail') {
      return res.status(response.errors!.code).json(response);
    }

    return res
      .status(200)
      .cookie('accessToken', token?.accessToken, {
        secure: true,
        sameSite: 'none',
        httpOnly: true,
        maxAge: accessTokenMaxAge,
      })
      .cookie('refreshToken', token?.refreshToken, {
        secure: true,
        sameSite: 'none',
        httpOnly: true,
        maxAge: refreshTokenMaxAge,
        path: '/api/refresh',
      })
      .json(response);
  };

  refreshToken = async (req: Request, res: Response<ApiResponse>) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res
        .status(400)
        .json({
          status: 'fail',
          errors: {
            code: 400,
            message: 'invalid request, refresh token unavailable',
          },
        });
    }
    const { response, token } = await this.service.refreshToken(refreshToken);
    if (response.status === 'fail') {
      return res.status(response.errors!.code).json(response);
    }

    return res
      .status(200)
      .cookie('accessToken', token, {
        secure: true,
        sameSite: 'none',
        httpOnly: true,
        maxAge: accessTokenMaxAge,
      })
      .cookie('refreshToken', refreshToken, {
        secure: true,
        sameSite: 'none',
        httpOnly: true,
        maxAge: refreshTokenMaxAge,
        path: '/api/refresh',
      })
      .json(response);
  };
}

export default AuthHandler;
