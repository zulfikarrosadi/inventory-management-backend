import { Request, Response } from 'express';
import {
  findWarehouseById,
  findWarehouses,
  saveWarehouse,
  updateWarehouseById,
} from './repository';
import { CreateWarehouse, UpdateWarehouse } from './schema';
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
    const warehouses = await findWarehouses();
    return res.status(201).json({
      status: 'success',
      data: { warehouse: warehouses },
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

export async function updateWarehouse(
  req: Request<{ id: string }, {}, UpdateWarehouse>,
  res: Response<ApiResponse>,
) {
  const warehouseId = parseInt(req.params.id, 10);
  try {
    const result = await updateWarehouseById(warehouseId, req.body);
    if (result instanceof Error) {
      throw new Error(result.message);
    }

    const updatedWarehouse = await findWarehouseById(result.id);

    return res
      .status(200)
      .json({ status: 'success', data: { warehouse: updatedWarehouse } });
  } catch (error: any) {
    console.log('update_warehouse', error);
    return res
      .status(404)
      .json({ status: 'fail', errors: { code: 404, message: error.message } });
  }
}
