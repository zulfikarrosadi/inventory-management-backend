import { Request, Response } from 'express';
import { CreateStock, UpdateStock, UpdateStockQuantity } from './schema';
import ApiResponse from '../schema';

interface InventoryService {
  createStock(data: CreateStock, userId: number): Promise<ApiResponse>
  getStockById(id: string): Promise<ApiResponse>
  updateStockQuantity(data: UpdateStockQuantity, userId: number): Promise<ApiResponse>
  updateStock(data: UpdateStock, stockId: string, userId: number): Promise<ApiResponse>
  deleteStockById(id: string): Promise<ApiResponse>
}

class InventoryHandler {
  constructor(private service: InventoryService) { }

  createStock = async (req: Request<{}, {}, CreateStock>,
    res: Response<ApiResponse>) => {
    const result = await this.service.createStock(req.body, res.locals.user.userId)
    if (result.status === "fail") {
      return res.status(result.errors.code).json(result)
    }
    return res.status(201).json(result)
  }

  getStockById = async (req: Request<{ id: string }>,
    res: Response<ApiResponse>,) => {

    const result = await this.service.getStockById(req.params.id)
    if (result.status === "fail") {
      return res.status(result.errors.code).json(result)
    }

    return res.status(200).json(result)
  }

  updateStockQuantity = async (
    req: Request<{ id: string }, Record<string, any>, UpdateStockQuantity>,
    res: Response<ApiResponse>
  ) => {
    const parsedId = parseInt(req.params.id, 10)
    const result = await this.service.updateStockQuantity(
      {
        ...req.body,
        created_at: new Date(req.body.created_at).getTime(),
        stock_id: parsedId
      },
      res.locals.user.userId
    )

    if (result.status === "fail") {
      return res.status(result.errors.code).json(result)
    }

    return res.status(200).json(result)
  }

  updateStock = async (req: Request<{ id: string }, {}, UpdateStock>,
    res: Response<ApiResponse>,) => {
    const result = await this.service.updateStock(req.body, req.params.id, res.locals.user.userId)
    if (result.status === "fail") {
      return res.status(result.errors.code).json(result)

    }
    return res.status(200).json(result)
  }


  deleteStock = async (
    req: Request<{ id: string }>,
    res: Response<ApiResponse>,
  ) => {
    const result = await this.service.deleteStockById(req.params.id);
    if (result.status === "fail") {
      return res.status(result.errors.code).json(result)

    }
    return res.status(200).json(result)
  }
}

export default InventoryHandler

