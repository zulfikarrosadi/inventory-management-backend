import type { Request, Response } from "express";
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

interface RoleService {
  create(data: CreateRole): Promise<ApiResponse<CreateRoleResult>>;
  addRoleToUsers(data: AddRoleUser): Promise<ApiResponse<AddRoleUserResult>>;
  updateUserRole(
    data: UpdateUserRole,
  ): Promise<ApiResponse<UpdateUserRoleResult>>;
  deleteUserRole(data: DeleteUserRole): Promise<ApiResponse<null>>;
}

class RoleHandler {
  constructor(protected service: RoleService) { }

  create = async (
    req: Request<Record<string, unknown>, Record<string, unknown>, CreateRole>,
    res: Response,
  ) => {
    const result = await this.service.create(req.body);
    if (result.status === "fail") {
      return res.status(result.errors.code).json(result);
    }

    return res.status(201).json(result);
  };

  addRoleToUser = async (
    req: Request<Record<string, unknown>, Record<string, unknown>, AddRoleUser>,
    res: Response,
  ) => {
    const result = await this.service.addRoleToUsers(req.body);
    if (result.status === "fail") {
      return res.status(result.errors.code).json(result);
    }

    return res.status(200).json(result);
  };

  updateUserRole = async (
    req: Request<
      Record<string, unknown>,
      Record<string, unknown>,
      UpdateUserRole
    >,
    res: Response,
  ) => {
    const result = await this.service.updateUserRole(req.body);
    if (result.status === "fail") {
      return res.status(result.errors.code).json(result);
    }

    return res.status(200).json(result);
  };

  deleteUserRole = async (
    req: Request<
      Record<string, unknown>,
      Record<string, unknown>,
      DeleteUserRole
    >,
    res: Response,
  ) => {
    const result = await this.service.deleteUserRole(req.body);
    if (result.status === "fail") {
      return res.status(result.errors.code).json(result);
    }

    return res.sendStatus(204);
  };
}

export default RoleHandler;
