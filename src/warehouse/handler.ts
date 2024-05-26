import { Request, Response } from 'express';
import { findWarehouses, saveWarehouse } from './repository';
import { CreateWarehouse } from './schema';
import ApiResponse from '../schema';

export async function createWarehouse(
  req: Request<{}, {}, CreateWarehouse>,
  res: Response<ApiResponse>,
) {
  try {
    const result = await saveWarehouse(req.body);
    if (result instanceof Error) {
      throw new Error(result.message);
    }

    return res.status(201).json({
      status: 'success',
      data: { warehouse: { id: result.insertId } },
    });
  } catch (error: any) {
    console.log('create_warehouse', error);

    return res
      .status(400)
      .json({ status: 'fail', errors: { code: 400, message: error.message } });
  }
}

export async function getWarehouses(req: Request, res: Response<ApiResponse>) {
  try {
    const result = await findWarehouses();
    if (result instanceof Error) {
      throw new Error(result.message);
    }

    return res
      .status(200)
      .json({ status: 'success', data: { warehouse: result } });
  } catch (error: any) {
    console.log('get_warhouses', error);
    return res
      .status(404)
      .json({ status: 'fail', errors: { code: 404, message: error.message } });
  }
}
