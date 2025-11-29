import path from "node:path";
import { hashSync } from "bcrypt";
import dotenv from "dotenv";
import { AuthCredentialError } from "../lib/Error";
import { createNewToken, refreshTokenMaxAge, verifyToken } from "../lib/token";
import type AuthRepository from "./repository";
import AuthService from "./service";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

describe("auth service", () => {
  let authRepo: jest.Mocked<AuthRepository>;
  let authService: AuthService;

  beforeEach(() => {
    authRepo = {
      getUserByEmail: jest.fn(),
      saveTokenToDb: jest.fn(),
      getTokenByUserId: jest.fn(),
    } as unknown as jest.Mocked<AuthRepository>;

    authService = new AuthService(authRepo);
  });

  describe("login", () => {
    it("should fail caused none existent user", async () => {
      authRepo.getUserByEmail.mockRejectedValue(new AuthCredentialError());

      const result = await authService.login({
        email: "nonexistent",
        password: "password",
      });
      expect(result.response.status).toBe("fail");
    });

    it("should fail caused wrong password", async () => {
      authRepo.getUserByEmail.mockResolvedValue({
        id: 1,
        email: "testing@mail.com",
        password: hashSync("password", 10),
      });

      const result = await authService.login({
        email: "testing@mail.com",
        password: "wrongpassword",
      });

      expect(authRepo.getUserByEmail).toHaveBeenCalled();
      expect(authRepo.getUserByEmail).toHaveBeenCalledWith("testing@mail.com");
      expect(result.response).toEqual({
        status: "fail",
        errors: { code: 401, message: "email or password is incorrect" },
      });
    });

    it("should success", async () => {
      authRepo.getUserByEmail.mockResolvedValue({
        id: 1,
        email: "test@email.com",
        password: hashSync("password", 10),
      });

      const result = await authService.login({
        email: "test@email.com",
        password: "password",
      });

      expect(authRepo.getUserByEmail).toHaveBeenCalled();
      expect(authRepo.getUserByEmail).toHaveBeenCalledWith("test@email.com");
      expect(result).toHaveProperty("response");
      expect(result).toHaveProperty("token");
      expect(result.response).toEqual({
        status: "success",
        data: { user: { id: 1, email: "test@email.com" } },
      });
    });
  });

  describe("refresh token", () => {
    it("should return new access token", async () => {
      const validRefreshToken = createNewToken({
        email: "test@email.com",
        userId: 1,
        expiration: refreshTokenMaxAge,
      });
      authRepo.getTokenByUserId.mockResolvedValue(validRefreshToken);
      const result = await authService.refreshToken(validRefreshToken);
      if (!result.token) {
        fail("auth service should return token");
      }
      expect(result).toHaveProperty("token");

      const { decodedData: accessToken } = verifyToken(result.token);
      expect(accessToken).toHaveProperty("email");
      expect(accessToken).toHaveProperty("userId");
      expect(accessToken?.userId).toBe(1);
      expect(accessToken?.email).toBe("test@email.com");
    });

    it("should fail caused invalid refresh token", async () => {
      const invalidToken = "invalid token";
      const result = await authService.refreshToken(invalidToken);
      if (result.response.status === "success") {
        fail("auth service should failed cause invalid token");
      }
      expect(result.response.status).toBe("fail");
      expect(result.response.errors?.message).toBe("invalid refresh token");
    });

    it("should fail caused token not found in db", async () => {
      const validRefreshToken = createNewToken({
        email: "test@email.com",
        userId: 1,
        expiration: refreshTokenMaxAge,
      });
      authRepo.getTokenByUserId.mockRejectedValue(
        "token not found in database",
      );
      const result = await authService.refreshToken(validRefreshToken);

      if (result.response.status === "success") {
        fail("auth service should failed cause invalid token");
      }
      expect(authRepo.getTokenByUserId).toHaveBeenCalled();
      expect(result).not.toHaveProperty("token");
      expect(result.response.status).toBe("fail");
      expect(result.response.errors?.message).toBe(
        "token not found in database",
      );
    });

    it("should fail caused token is not the same with in db", async () => {
      const tokenFromDb = createNewToken({
        email: "test@email.com",
        userId: 1,
        expiration: refreshTokenMaxAge,
      });
      authRepo.getTokenByUserId.mockResolvedValue(tokenFromDb);

      const tokenFromUser = createNewToken({
        email: "test@email.com",
        userId: 1,
        expiration: refreshTokenMaxAge,
      });
      const result = await authService.refreshToken(tokenFromUser);

      if (result.response.status === "success") {
        fail("auth service should failed cause invalid token");
      }
      expect(authRepo.getTokenByUserId).toHaveBeenCalled();
      expect(result).not.toHaveProperty("token");
      expect(result.response.status).toBe("fail");
      expect(result.response.errors?.message).toBe("invalid refresh token");
    });
  });
});
