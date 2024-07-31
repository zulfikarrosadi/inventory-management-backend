import UserRepository from './repository';
import UserSerivce from './service';
import { UsernameAlreadyExistsError } from '../lib/Error';

describe('user service', () => {
  let userRepo: jest.Mocked<UserRepository>;
  let userService: UserSerivce;

  beforeEach(() => {
    userRepo = {
      USER_ALREADY_EXISTS: 1062,
      createUser: jest.fn(),
      getUserById: jest.fn(),
      saveTokenToDb: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    userService = new UserSerivce(userRepo);
  });

  describe('register user', () => {
    it('should register new user', async () => {
      userRepo.createUser.mockResolvedValue({ userId: 1 });
      userRepo.saveTokenToDb.mockResolvedValue({ affectedRows: 1 });
      userRepo.getUserById.mockResolvedValue({
        id: 1,
        username: 'testing_username',
      });
      const newUser = await userService.registerUser({
        username: 'testing_username',
        password: 'password',
      });

      expect(userRepo.createUser).toHaveBeenCalled();
      expect(newUser.response.status).toBe('success');
      expect(newUser.response.data.user.id).toBe(1);
      expect(newUser.response.data.user.username).toBe('testing_username');
      expect(newUser).toHaveProperty('token');
      expect(newUser.token?.accessToken).not.toBeNull();
      expect(newUser.token?.refreshToken).not.toBeNull();
    });

    it('should fail: username already exists', async () => {
      userRepo.createUser.mockRejectedValue(new UsernameAlreadyExistsError());
      const newUser = await userService.registerUser({
        username: 'already_exist_username',
        password: 'password',
      });

      expect(userRepo.createUser).toHaveBeenCalled();
      expect(newUser.response.status).toBe('fail');
      expect(newUser.response.errors?.message).toBe(
        'this username already exists',
      );
    });
  });

  describe('get user by id', () => {
    it('should fail: user not found cause bad user id', async () => {
      const user = await userService.getUserById('bad_user_id');
      expect(user.response.status).toBe('fail');
      expect(user.response.errors?.message).toBe('user not found');
    });

    it("should fail: user not found cause user id doesn't exist", async () => {
      userRepo.getUserById.mockRejectedValue('user not found');
      const user = await userService.getUserById('99999');

      expect(user.response.status).toBe('fail');
      expect(user.response.errors?.message).toBe('user not found');
    });

    it('should success', async () => {
      userRepo.getUserById.mockResolvedValue({
        id: 1,
        username: 'testing_username',
      });
      const user = await userService.getUserById('1');

      expect(user.response.status).toBe('success');
      expect(user.response.data.user.id).toBe(1);
      expect(user.response.data.user.username).toBe('testing_username');
    });
  });
});
