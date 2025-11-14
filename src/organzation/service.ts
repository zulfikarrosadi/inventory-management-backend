import type { ResultSetHeader } from "mysql2";
import { AppError, BadRequestError } from "../lib/Error";
import type { Logger } from "../lib/logger";
import type ApiResponse from "../schema";
import type { CreateOrg, FindByIdResult, Org, UpdateOrg } from "./schema";
import { getContext } from "../lib/asyncLocalStorage";

interface OrgRepository {
  create(userId: number, data: CreateOrg): Promise<ResultSetHeader>;
  findById(id: number): Promise<FindByIdResult>;
  deleteById(id: number): Promise<ResultSetHeader>;
  updateById(
    id: number,
    version: number,
    data: UpdateOrg,
  ): Promise<ResultSetHeader>;
}

class OrgService {
  constructor(
    private repository: OrgRepository,
    public logger: Logger,
  ) { }

  create = async (
    userId: number,
    data: CreateOrg,
  ): Promise<ApiResponse<Org>> => {
    try {
      const result = await this.repository.create(userId, data);

      return {
        status: "success",
        data: {
          organization: {
            id: result.insertId,
            name: data.name,
            address: data.address,
          },
        },
      };
    } catch (error) {
      const context = getContext();
      this.logger("warn", "create new org fail in service", context, error);
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
          message: "something went wrong, please try again later",
        },
      };
    }
  };

  updateById = async (
    id: string,
    data: UpdateOrg,
  ): Promise<ApiResponse<Org>> => {
    try {
      const parsedId = parseInt(id, 10);
      if (Number.isNaN(parsedId)) {
        throw new BadRequestError(
          "fail to update organization, enter all correct info and try again",
        );
      }
      const currOrganization = await this.repository.findById(parsedId);
      await this.repository.updateById(
        parsedId,
        currOrganization.version,
        data,
      );

      return {
        status: "success",
        data: {
          organization: {
            id: parsedId,
            name: data.name,
            address: data.address,
          },
        },
      };
    } catch (error) {
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
          message: "something went wrong, please try again later",
        },
      };
    }
  };

  findById = async (id: string): Promise<ApiResponse<Org>> => {
    try {
      const parsedId = parseInt(id, 10);
      if (Number.isNaN(parsedId)) {
        throw new BadRequestError(
          "fail to update organization, enter all correct info and try again",
        );
      }
      const result = await this.repository.findById(parsedId);

      return {
        status: "success",
        data: {
          organization: {
            id: parsedId,
            name: result.name,
            address: result.address,
          },
        },
      };
    } catch (error) {
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
          message: "something went wrong, please try again later",
        },
      };
    }
  };

  deleteById = async (id: string): Promise<ApiResponse<null>> => {
    try {
      const parsedId = parseInt(id, 10);
      if (Number.isNaN(parsedId)) {
        throw new BadRequestError(
          "fail to update organization, enter all correct info and try again",
        );
      }
      await this.repository.deleteById(parsedId);

      return {
        status: "success",
        data: {
          organization: null,
        },
      };
    } catch (error) {
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
          message: "something went wrong, please try again later",
        },
      };
    }
  };
}

export default OrgService;
