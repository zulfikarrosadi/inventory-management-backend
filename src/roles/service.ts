import { AppError } from "../lib/Error";
import type ApiResponse from "../schema";
import type {
  AddRoleUser,
  AddRoleUserResult,
  CreateRole,
  CreateRoleResult,
  DeleteUserRole,
  UpdateUserRole,
  UpdateUserRoleResult,
} from "./schema";

interface RoleRepository {
  create(data: CreateRole): Promise<CreateRoleResult>;
  addRoleToUsers(data: AddRoleUser): Promise<AddRoleUserResult>;
  updateUserRole(data: UpdateUserRole): Promise<UpdateUserRoleResult>;
  deleteUserRole(data: DeleteUserRole): Promise<void>;
}

class RoleService {
  constructor(protected repo: RoleRepository) { }

  create = async (data: CreateRole): Promise<ApiResponse<CreateRoleResult>> => {
    try {
      const result = await this.repo.create(data);

      return {
        status: "success",
        data: {
          user_role: result,
        },
      };
    } catch (error: unknown) {
      if (error instanceof AppError) {
        return {
          status: "fail",
          errors: {
            code: error.code,
            message: error.message,
          },
        };
      }
      return {
        status: "fail",
        errors: {
          code: 500,
          message: "Somethigng went wrong, please try again later",
        },
      };
    }
  };

  addRoleToUsers = async (
    data: AddRoleUser,
  ): Promise<ApiResponse<AddRoleUserResult>> => {
    try {
      const result = await this.repo.addRoleToUsers(data);

      return {
        status: "success",
        data: {
          user: result,
        },
      };
    } catch (error: unknown) {
      if (error instanceof AppError) {
        return {
          status: "fail",
          errors: {
            code: error.code,
            message: error.message,
          },
        };
      }

      return {
        status: "fail",
        errors: {
          code: 500,
          message: "Something went wrong, please try again later",
        },
      };
    }
  };

  updateUserRole = async (
    data: UpdateUserRole,
  ): Promise<ApiResponse<UpdateUserRoleResult>> => {
    try {
      const result = await this.repo.updateUserRole(data);

      return {
        status: "success",
        data: {
          user: result,
        },
      };
    } catch (error: unknown) {
      if (error instanceof AppError) {
        return {
          status: "fail",
          errors: {
            code: error.code,
            message: error.message,
          },
        };
      }
      return {
        status: "fail",
        errors: {
          code: 500,
          message: "Something went wrong, please try again later",
        },
      };
    }
  };

  deleteUserRole = async (data: DeleteUserRole): Promise<ApiResponse<null>> => {
    try {
      await this.repo.deleteUserRole(data);
      return {
        status: "success",
        data: {},
      };
    } catch (error: unknown) {
      if (error instanceof AppError) {
        return {
          status: "fail",
          errors: {
            code: error.code,
            message: error.message,
          },
        };
      }
      return {
        status: "fail",
        errors: {
          code: 500,
          message: "Something went wrong, please try again later",
        },
      };
    }
  };
}

export default RoleService;
