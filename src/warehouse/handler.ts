import { Request, Response } from 'express';
import {
  deleteWarehouseById,
  findStocksFromAllWarehouses,
  findStocksFromWarehouse,
  findWarehouseById,
  findWarehouses,
  saveWarehouse,
  updateWarehouseById,
} from './repository';
import { CreateWarehouse, UpdateWarehouse } from './schema';
import ApiResponse, { CurrentUser } from '../schema';

export async function createWarehouse(
  req: Request<{}, {}, CreateWarehouse>,
  res: Response<ApiResponse, CurrentUser>,
) {
  try {
    const result = await saveWarehouse(req.body, res.locals.user.userId);
    if (result instanceof Error) {
      throw new Error(result.message);
    }

    const warehouses = await findWarehouses(res.locals.user.userId);
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

export async function getWarehouses(
  req: Request,
  res: Response<ApiResponse, CurrentUser>,
) {
  try {
    const result = await findWarehouses(res.locals.user.userId);

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
  res: Response<ApiResponse, CurrentUser>,
) {
  const warehouseId = parseInt(req.params.id, 10);
  try {
    const result = await updateWarehouseById(
      warehouseId,
      res.locals.user.userId,
      req.body,
    );
    if (result instanceof Error) {
      throw new Error(result.message);
    }
    console.log(result);

    const updatedWarehouse = await findWarehouseById(
      warehouseId,
      res.locals.user.userId,
    );

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
  res: Response<ApiResponse, CurrentUser>,
) {
  const warehouseId = parseInt(req.params.id, 10);
  try {
    const stocksFromWarehouse = await findStocksFromWarehouse(
      warehouseId,
      res.locals.user.userId,
    );
    if (stocksFromWarehouse instanceof Error) {
      throw new Error(stocksFromWarehouse.message);
    }
    const warehouse = await findWarehouseById(
      warehouseId,
      res.locals.user.userId,
    );

    return res.status(200).json({
      status: 'success',
      data: {
        warehouse: {
          id: warehouse.id,
          name: warehouse.name,
          address: warehouse.address,
        },
        stocks: stocksFromWarehouse.map((stocks) => {
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
    if (error.sqlState === '42S522') {
      return res.status(400).json({
        status: 'fail',
        errors: {
          code: 400,
          message: 'fail to retrive stocks information, please try again',
        },
      });
    }
    return res
      .status(404)
      .json({ status: 'fail', errors: { code: 404, message: error.message } });
  }
}

export async function deleteWarehouse(
  req: Request<{ id: string }>,
  res: Response<ApiResponse, CurrentUser>,
) {
  const warehouseId = parseInt(req.params.id, 10);
  try {
    await deleteWarehouseById(warehouseId, res.locals.user.userId);

    return res.sendStatus(204);
  } catch (error: any) {
    console.log('delete_warehouse', error);

    return res
      .status(400)
      .json({ status: 'fail', errors: { message: error.message, code: 400 } });
  }
}

export async function getStocksFromAllWarehouses(
  req: Request,
  res: Response<ApiResponse, CurrentUser>,
) {
  try {
    const result = await findStocksFromAllWarehouses(res.locals.user.userId);
    const warehouseMap = new Map();

    result.forEach((item) => {
      const warehouse = {
        id: item.warehouse_id,
        name: item.warehouse_name,
        address: item.warehouse_address,
      };
      const stock = {
        id: item.id,
        name: item.name,
        supplier: item.supplier,
        quantity: item.quantity,
        cost_price: item.cost_price,
        purchase_date: item.purchase_date,
        stock_due_date: item.stock_due_date,
        created_at: item.created_at,
        updated_at: item.updated_at,
        amount: item.cost_price * item.quantity,
      };

      if (!warehouseMap.has(item.warehouse_id)) {
        warehouseMap.set(item.warehouse_id, { ...warehouse, stocks: [] });
      }

      warehouseMap.get(item.warehouse_id).stocks.push(stock);
    });

    return res.status(200).json({
      status: 'success',
      data: { warehouses: Array.from(warehouseMap.values()) },
    });
  } catch (error: any) {
    console.log('get_stocks_from_all_warehouses', error);
    return res
      .status(404)
      .json({ status: 'fail', errors: { message: error.message, code: 404 } });
  }
}
