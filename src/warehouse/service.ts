import { Stock } from '../inventory/schema';
import { NotFoundError } from '../lib/Error';
import ApiResponse from '../schema';
import { CreateWarehouse, UpdateWarehouse, Warehouse } from './schema';

interface WarehouseRepository {
  saveWarehouse(
    data: CreateWarehouse,
    userId: number,
  ): Promise<{ warehouseId: number } | Error>;
  findWarehouses(userId: number): Promise<Warehouse[] | Error>;
  findWarehouseById(warehouseId: number, userId: number): Promise<Warehouse>;
  updateWarehouseById(
    warehouseId: number,
    userId: number,
    data: UpdateWarehouse,
  ): Promise<{ affectedRows: number }>;
  findStockFromWarehouse(warehouseId: number, userId: number): Promise<Stock[]>;
  deleteWarehouseById(
    warehouseId: number,
    userId: number,
  ): Promise<{ affectedRows: number }> | Error;
  findStocksFromAllWarehouses(userId: number): Promise<
    Array<
      {
        warehouse_id: number;
        warehouse_name: string;
        warehouse_address: string;
      } & Stock
    >
  >;
}

class WarehosueService {
  constructor(public repo: WarehouseRepository) {}

  public createWarehouse = async (
    data: CreateWarehouse,
    userId: number,
  ): Promise<ApiResponse> => {
    try {
      await this.repo.saveWarehouse(data, userId);
      const warehouses = await this.repo.findWarehouses(userId);

      return {
        status: 'success',
        data: { warehouses },
      };
    } catch (error: any) {
      return {
        status: 'fail',
        errors: {
          code: 500,
          message: error.message || error,
        },
      };
    }
  };

  public getWarehouses = async (userId: number): Promise<ApiResponse> => {
    try {
      const result = await this.repo.findWarehouses(userId);

      return {
        status: 'success',
        data: { warehouses: result },
      };
    } catch (error: any) {
      return {
        status: 'fail',
        errors: {
          code: 404,
          message: error.message,
        },
      };
    }
  };

  public updateWarehouse = async (
    warehouseId: number,
    userId: number,
    data: UpdateWarehouse,
  ): Promise<ApiResponse> => {
    try {
      const result = await this.repo.updateWarehouseById(
        warehouseId,
        userId,
        data,
      );
      const updatedWarehouse = await this.repo.findWarehouseById(
        warehouseId,
        userId,
      );

      return {
        status: 'success',
        data: {
          warehouses: updatedWarehouse,
        },
      };
    } catch (error: any) {
      return {
        status: 'fail',
        errors: {
          code: 500,
          message: error.message || error,
        },
      };
    }
  };

  public findStockFromWarehouse = async (
    warehouseId: number,
    userId: number,
  ): Promise<ApiResponse> => {
    try {
      const stocksFromWarehouse = await this.repo.findStockFromWarehouse(
        warehouseId,
        userId,
      );
      const warehouse = await this.repo.findWarehouseById(warehouseId, userId);

      return {
        status: 'success',
        data: {
          warehouses: {
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
      };
    } catch (error: any) {
      return {
        status: 'fail',
        errors: {
          code: 404,
          message: error.message || error,
        },
      };
    }
  };

  public deleteWarehouse = async (
    warehouseId: number,
    userId: number,
  ): Promise<ApiResponse> => {
    try {
      await this.repo.deleteWarehouseById(warehouseId, userId);
      return {
        status: 'success',
      };
    } catch (error: any) {
      return {
        status: 'fail',
        errors: {
          code: 400,
          message: error.message || error,
        },
      };
    }
  };

  public findStockFromAllWarehouses = async (
    userId: number,
  ): Promise<ApiResponse> => {
    try {
      const result = await this.repo.findStocksFromAllWarehouses(userId);
      const resultMap = new Map();
      console.log(result);

      result.forEach((item) => {
        const warehouse = {
          id: item.warehouse_id,
          name: item.warehouse_name,
          address: item.warehouse_address,
        };
        const stock = {
          id: item.id,
          name: item.name,
          purchase_date: item.purchase_date,
          stock_due_date: item.stock_due_date,
          supplier: item.supplier,
          quantity: item.quantity,
          cost_price: item.cost_price,
          amount: item.cost_price * item.quantity,
          updated_at: item.updated_at,
        };

        if (!resultMap.has(item.warehouse_id)) {
          resultMap.set(item.warehouse_id, { ...warehouse, stocks: [] });
        }

        resultMap.get(item.warehouse_id).stocks.push(stock);
      });

      return {
        status: 'success',
        data: { warehouses: Array.from(resultMap.values()) },
      };
    } catch (error: any) {
      return {
        status: 'fail',
        errors: {
          code: 404,
          message: error.message || error,
        },
      };
    }
  };
}

export default WarehosueService;
