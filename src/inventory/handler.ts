import { Request, Response } from 'express';
import { CreateStock, UpdateStock } from './schema';
import ApiResponse, { CurrentUser } from '../schema';
import InventoryService from './service';


class InventoryHandler {
  constructor(private service: InventoryService) { }

  createStock = async (req: Request<{}, {}, CreateStock>,
    res: Response<ApiResponse, CurrentUser>,) => {
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

  updateStock = async (req: Request<{ id: string }, {}, UpdateStock>,
    res: Response<ApiResponse>,) => {
    const result = await this.service.updateStock(req.body, req.params.id, res.locals.user.id)
    if (result.status === "fail") {
      return res.status(result.errors.code).json(result)

    }
    return res.status(200).json(result)
  }
}

export default InventoryHandler


export async function deleteStock(
  req: Request<{ id: string }>,
  res: Response<ApiResponse>,
) {
  const id = parseInt(req.params.id, 10);
  try {
    const result = await deleteStockById(id);
    if (result instanceof Error) {
      throw new Error(result.message);
    }

    return res.sendStatus(204);
  } catch (error: any) {
    console.log('delete_stock: ', error);

    return res
      .status(404)
      .json({ status: 'fail', errors: { message: error.message, code: 404 } });
  }
}


