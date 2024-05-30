import { Request, Response } from 'express';
import {
  deleteWarehouseById,
  findStocksFromWarehouse,
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
    console.log(result);

    const updatedWarehouse = await findWarehouseById(warehouseId);

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

export async function getStocksFromWarehouse(
  req: Request<{ id: string }>,
  res: Response<ApiResponse>,
) {
  const warehouseId = parseInt(req.params.id, 10);
  try {
    const stocksFromWarehouse = await findStocksFromWarehouse(warehouseId);
    if (stocksFromWarehouse instanceof Error) {
      throw new Error(stocksFromWarehouse.message);
    }
    const warehouse = await findWarehouseById(warehouseId);

    return res.status(200).json({
      status: 'success',
      data: {
        warehouse: {
          id: warehouse.id,
          name: warehouse.name,
          address: warehouse.address,
        },
        stock: stocksFromWarehouse.map((stocks) => {
          return {
            id: stocks.id,
            name: stocks.name,
            purchase_date: stocks.purchase_date,
            stock_due_date: stocks.stock_due_date,
            supplier: stocks.supplier,
            quantity: stocks.quantity,
            cost_price: stocks.cost_price,
            amount: stocks.cost_price * stocks.quantity,
            updated_at: stocks.updated_at,
          };
        }),
      },
    });
  } catch (error: any) {
    console.log('get_stocks_from_warehouse', error);

    return res
      .status(404)
      .json({ status: 'fail', errors: { code: 404, message: error.message } });
  }
}

export async function deleteWarehouse(
  req: Request<{ id: string }>,
  res: Response<ApiResponse>,
) {
  const warehouseId = parseInt(req.params.id, 10);
  try {
    await deleteWarehouseById(warehouseId);

    return res.sendStatus(204);
  } catch (error: any) {
    console.log('delete_warehouse', error);

    return res
      .status(400)
      .json({ status: 'fail', errors: { message: error.message, code: 400 } });
  }
}
