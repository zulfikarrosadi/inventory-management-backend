import type { Request, Response } from "express";
import type ApiResponse from "../schema";
import type { CreateOrg, Org, UpdateOrg } from "./schema";

interface OrgService {
  create(userId: number, data: CreateOrg): Promise<ApiResponse<Org>>;
  findById(id: string): Promise<ApiResponse<Org>>;
  deleteById(id: string): Promise<ApiResponse<null>>;
  updateById(id: string, data: UpdateOrg): Promise<ApiResponse<Org>>;
}

class OrgHandler {
  constructor(private service: OrgService) { }

  create = async (
    req: Request<Record<string, unknown>, Record<string, unknown>, CreateOrg>,
    res: Response,
  ) => {
    const result = await this.service.create(res.locals.user.userId, req.body);
    if (result.status === "fail") {
      return res.status(result.errors.code).json(result);
    }
    return res.status(201).json(result);
  };

  findById = async (req: Request<{ id: string }>, res: Response) => {
    const result = await this.service.findById(req.params.id);
    if (result.status === "fail") {
      return res.status(result.errors.code).json(result);
    }

    return res.status(200).json(result);
  };

  updateById = async (
    req: Request<{ id: string }, Record<string, unknown>, UpdateOrg>,
    res: Response,
  ) => {
    const result = await this.service.updateById(req.params.id, req.body);
    if (result.status === "fail") {
      return res.status(result.errors.code).json(result);
    }

    return res.status(200).json(result);
  };

  deleteById = async (req: Request<{ id: string }>, res: Response) => {
    const result = await this.service.deleteById(req.params.id);
    if (result.status === "fail") {
      return res.status(result.errors.code).json(result);
    }

    return res.sendStatus(204);
  };
}

export default OrgHandler;
