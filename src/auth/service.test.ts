import AuthRepository from './repository';
import AuthService from './service';
import { AuthCredentialError } from '../lib/Error';
import { hashSync } from 'bcrypt';
import { createNewToken, refreshTokenMaxAge, verifyToken } from '../lib/token';

describe('auth service', () => {
  let authRepo: jest.Mocked<AuthRepository>;
  let authService: AuthService;

  beforeEach(() => {
    authRepo = {
      getUserByUsername: jest.fn(),
      saveTokenToDb: jest.fn(),
      getTokenByUserId: jest.fn(),
    } as unknown as jest.Mocked<AuthRepository>;

    authService = new AuthService(authRepo);
  });

  describe('login', () => {
    it('should fail caused none existent user', async () => {
      authRepo.getUserByUsername.mockRejectedValue(new AuthCredentialError());

      const result = await authService.login({
        username: 'nonexistent',
        password: 'password',
      });
      expect(result.response.status).toBe('fail');
    });

    it('should fail caused wrong password', async () => {
      authRepo.getUserByUsername.mockResolvedValue({
        id: 1,
        username: 'testing_username',
        password: hashSync('password', 10),
      });

      const result = await authService.login({
        username: 'testing_username',
        password: 'wrongpassword',
      });

      expect(authRepo.getUserByUsername).toHaveBeenCalled();
      expect(authRepo.getUserByUsername).toHaveBeenCalledWith(
        'testing_username',
      );
      expect(result.response).toEqual({
        status: 'fail',
        errors: { code: 400, message: 'username or password is incorrect' },
      });
    });

    it('should success', async () => {
      authRepo.getUserByUsername.mockResolvedValue({
        id: 1,
        username: 'testing_username',
        password: hashSync('password', 10),
      });

      const result = await authService.login({
        username: 'testing_username',
        password: 'password',
      });

      expect(authRepo.getUserByUsername).toHaveBeenCalled();
      expect(authRepo.getUserByUsername).toHaveBeenCalledWith(
        'testing_username',
      );
      expect(result).toHaveProperty('response');
      expect(result).toHaveProperty('token');
      expect(result.response).toEqual({
        status: 'success',
        data: { user: { id: 1, username: 'testing_username' } },
      });
    });
  });

  describe('refresh token', () => {
    it('should return new access token', async () => {
      const validRefreshToken = createNewToken({
        username: 'testing_username',
        userId: 1,
        expiration: refreshTokenMaxAge,
      });
      authRepo.getTokenByUserId.mockResolvedValue(validRefreshToken);
      const result = await authService.refreshToken(validRefreshToken);
      expect(result).toHaveProperty('token');

      const { decodedData: accessToken } = verifyToken(result.token!);
      expect(accessToken).toHaveProperty('username');
      expect(accessToken).toHaveProperty('userId');
      expect(accessToken?.userId).toBe(1);
      expect(accessToken?.username).toBe('testing_username');
    });

    it('should fail caused invalid refresh token', async () => {
      const invalidToken = 'invalid token';
      const result = await authService.refreshToken(invalidToken);
      expect(result.response.status).toBe('fail');
      expect(result.response.errors?.message).toBe('invalid refresh token');
    });

    it('should fail caused token not found in db', async () => {
      const validRefreshToken = createNewToken({
        username: 'testing_username',
        userId: 1,
        expiration: refreshTokenMaxAge,
      });
      authRepo.getTokenByUserId.mockRejectedValue(
        'token not found in database',
      );
      const result = await authService.refreshToken(validRefreshToken);

      expect(authRepo.getTokenByUserId).toHaveBeenCalled();
      expect(result).not.toHaveProperty('token');
      expect(result.response.status).toBe('fail');
      expect(result.response.errors?.message).toBe(
        'token not found in database',
      );
    });

    it('should fail caused token is not the same with in db', async () => {
      const tokenFromDb = createNewToken({
        username: 'testing_username',
        userId: 1,
        expiration: refreshTokenMaxAge,
      });
      authRepo.getTokenByUserId.mockResolvedValue(tokenFromDb);

      const tokenFromUser = createNewToken({
        username: 'invalid username but valid token',
        userId: 1,
        expiration: refreshTokenMaxAge,
      });
      const result = await authService.refreshToken(tokenFromUser);

      expect(authRepo.getTokenByUserId).toHaveBeenCalled();
      expect(result).not.toHaveProperty('token');
      expect(result.response.status).toBe('fail');
      expect(result.response.errors?.message).toBe('invalid refresh token');
    });
  });
});
