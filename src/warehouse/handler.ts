import { Request, Response } from 'express';
import ApiResponse, { CurrentUser } from '../schema';
import { CreateWarehouse, UpdateWarehouse } from './schema';

interface WarehouseService {
  createWarehouse(data: CreateWarehouse, userId: number): Promise<ApiResponse>;
  getWarehouses(userId: number): Promise<ApiResponse>;
  updateWarehouse(
    warehouseId: number,
    userId: number,
    data: UpdateWarehouse,
  ): Promise<ApiResponse>;
  findStockFromWarehouse(
    warehouseId: number,
    userId: number,
  ): Promise<ApiResponse>;
  deleteWarehouse(warehouseId: number, userId: number): Promise<ApiResponse>;
  findStockFromAllWarehouses(userId: number): Promise<ApiResponse>;
}

class WarehouseHandler {
  constructor(public service: WarehouseService) {}

  createWarehouse = async (
    req: Request<{}, {}, CreateWarehouse>,
    res: Response<ApiResponse, CurrentUser>,
  ) => {
    const result = await this.service.createWarehouse(
      req.body,
      res.locals.user.userId,
    );
    if (result.status === 'fail') {
      return res.status(result.errors!.code).json(result);
    }
    return res.status(201).json(result);
  };

  getWarehouses = async (
    req: Request,
    res: Response<ApiResponse, CurrentUser>,
  ) => {
    const warehouses = await this.service.getWarehouses(res.locals.user.userId);
    if (warehouses.status === 'fail') {
      return res.status(warehouses.errors?.code!).json(warehouses);
    }
    return res.status(200).json(warehouses);
  };

  updateWarehouse = async (
    req: Request<{ id: string }, {}, UpdateWarehouse>,
    res: Response<ApiResponse, CurrentUser>,
  ) => {
    const warehouseId = parseInt(req.params.id);
    if (isNaN(warehouseId)) {
      return res.sendStatus(404);
    }
    const result = await this.service.updateWarehouse(
      warehouseId,
      res.locals.user.userId,
      req.body,
    );
    return res.status(200).json(result);
  };

  getStockFromWarehouse = async (
    req: Request<{ id: string }>,
    res: Response<ApiResponse, CurrentUser>,
  ) => {
    const warehouseId = parseInt(req.params.id, 10);
    if (isNaN(warehouseId)) {
      return res.sendStatus(404);
    }
    const result = await this.service.findStockFromWarehouse(
      warehouseId,
      res.locals.user.userId,
    );
    if (result.status === 'fail') {
      return res.status(result.errors?.code!).json(result);
    }
    return res.status(200).json(result);
  };

  deleteWarehouse = async (
    req: Request<{ id: string }>,
    res: Response<ApiResponse, CurrentUser>,
  ) => {
    const warehouseId = parseInt(req.params.id, 10);
    if (isNaN(warehouseId)) {
      return res.sendStatus(404);
    }
    const result = await this.service.deleteWarehouse(
      warehouseId,
      res.locals.user.userId,
    );
    if (result.status === 'fail') {
      return res.status(400).json(result);
    }
    return res.sendStatus(204);
  };

  getStocksFromAllWarehouses = async (
    req: Request,
    res: Response<ApiResponse, CurrentUser>,
  ) => {
    const result = await this.service.findStockFromAllWarehouses(
      res.locals.user.userId,
    );
    if (result.status === 'fail') {
      return res.status(result.errors?.code!).json(result);
    }
    return res.status(200).json(result);
  };
}

export default WarehouseHandler;
