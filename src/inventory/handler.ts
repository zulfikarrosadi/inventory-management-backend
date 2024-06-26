import { Request, Response } from 'express';
import {
  deleteStockById,
  findStockById,
  saveStock,
  updateStockById,
} from './repository';
import { CreateStock, UpdateStock } from './schema';
import ApiResponse, { CurrentUser } from '../schema';
import { findStocksFromWarehouse } from '../warehouse/repository';

export async function createStock(
  req: Request<{}, {}, CreateStock>,
  res: Response<ApiResponse, CurrentUser>,
) {
  try {
    const newStock = await saveStock({
      ...req.body,
      purchase_date: new Date(req.body.purchase_date).getTime(),
      stock_due_date: new Date(req.body.stock_due_date).getTime(),
      created_at: new Date(req.body.created_at).getTime(),
    });
    if (newStock instanceof Error) {
      throw new Error(newStock.message);
    }
    const result = await findStocksFromWarehouse(
      req.body.warehouse_id,
      res.locals.user.userId,
    );

    return res.status(201).json({
      status: 'success',
      data: {
        warehouse: {
          id: result[0].warehouse_id,
          name: result[0].warehouse_name,
          address: result[0].warehouse_address,
        },
        stocks: result.map((stock) => {
          return {
            id: stock.id,
            name: stock.name,
            purchase_date: stock.purchase_date,
            stock_due_date: stock.stock_due_date,
            supplier: stock.supplier,
            quantity: stock.quantity,
            cost_price: stock.cost_price,
            amount: stock.cost_price * stock.quantity,
          };
        }),
      },
    });
  } catch (error: any) {
    console.log('create_stock', error);
    return res
      .status(400)
      .json({ status: 'fail', errors: { code: 400, message: error.message } });
  }
}

export async function getStockById(
  req: Request<{ id: string }>,
  res: Response<ApiResponse>,
) {
  const id = parseInt(req.params.id, 10);
  try {
    const result = await findStockById(id);
    if (result instanceof Error) {
      throw new Error(result.message);
    }

    return res.status(200).json({
      status: 'success',
      data: {
        stocks: {
          id: result.id,
          name: result.name,
          purchase_date: result.purchase_date,
          stock_due_date: result.stock_due_date,
          supplier: result.supplier,
          quantity: result.quantity,
          cost_price: result.cost_price,
          amount: result.cost_price * result.quantity,
        },
      },
    });
  } catch (error: any) {
    console.log('get_stock_by_id', error);

    return res
      .status(404)
      .json({ status: 'fail', errors: { code: 404, message: error.message } });
  }
}

export async function updateStock(
  req: Request<{ id: string }, {}, UpdateStock>,
  res: Response<ApiResponse>,
) {
  try {
    const id = parseInt(req.params.id, 10);
    const updatedStock = await updateStockById(id, {
      ...req.body,
      purchase_date: new Date(req.body.purchase_date).getTime(),
      stock_due_date: new Date(req.body.stock_due_date).getTime(),
      updated_at: new Date(req.body.updated_at).getTime(),
    });

    if (updatedStock instanceof Error) {
      throw new Error(updatedStock.message);
    }
    const result = await findStocksFromWarehouse(
      req.body.warehouse_id,
      res.locals.user.userId,
    );

    return res.status(201).json({
      status: 'success',
      data: {
        warehouse: {
          id: result[0].warehouse_id,
          name: result[0].warehouse_name,
          address: result[0].warehouse_address,
        },
        stocks: result.map((stock) => {
          return {
            id: stock.id,
            name: stock.name,
            purchase_date: stock.purchase_date,
            stock_due_date: stock.stock_due_date,
            supplier: stock.supplier,
            quantity: stock.quantity,
            cost_price: stock.cost_price,
            amount: stock.cost_price * stock.quantity,
          };
        }),
      },
    });
  } catch (error: any) {
    return res
      .status(400)
      .json({ status: 'fail', errors: { code: 400, message: error.message } });
  }
}

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
