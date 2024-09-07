import { ResultSetHeader } from 'mysql2';
import { CreateStock, Stock, UpdateStock } from './schema';
import ApiResponse from '../schema';
import { NotFoundError } from '../lib/Error';

interface InventoryRepository {
  saveStock(data: CreateStock): Promise<ResultSetHeader>;
  findStockById(id: number): Promise<Stock>;
  updateStockById(data: UpdateStock, id: number): Promise<ResultSetHeader>;
  deleteStockById(id: number): Promise<ResultSetHeader>;
}

interface WarehouseRepo {
  findStockFromWarehouse(
    warehouseId: number,
    userId: number,
  ): Promise<
    Array<
      Stock & {
        warehouse_id: number;
        warehouse_name: string;
        warehouse_address: string;
      }
    >
  >;
}

class InventoryService {
  constructor(
    public inventoryRepo: InventoryRepository,
    public warehouseRepo: WarehouseRepo,
  ) {}

  createStock = async (
    data: CreateStock,
    userId: number,
  ): Promise<ApiResponse> => {
    try {
      await this.inventoryRepo.saveStock({
        ...data,
        purchase_date: new Date(data.purchase_date).getTime(),
        stock_due_date: new Date(data.stock_due_date).getTime(),
        created_at: new Date(data.created_at).getTime(),
      });
      const result = await this.warehouseRepo.findStockFromWarehouse(
        data.warehouse_id,
        userId,
      );
      return {
        status: 'success',
        data: {
          warehouses: {
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

  getStockById = async (id: string): Promise<ApiResponse> => {
    try {
      const stockId = parseInt(id, 10);
      if (isNaN(stockId)) {
        throw new NotFoundError(
          'stock not found, enter the correct information then try again',
        );
      }

      const result = await this.inventoryRepo.findStockById(stockId);
      return {
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

  updateStock = async (
    data: UpdateStock,
    stockId: string,
    userId: number,
  ): Promise<ApiResponse> => {
    const id = parseInt(stockId, 10);
    if (isNaN(id)) {
      throw new NotFoundError(
        'updating stock failed, please enter the correct info and try again',
      );
    }
    const updatedStock = await this.inventoryRepo.updateStockById(data, id);
    const result = this.warehouseRepo.findStockFromWarehouse(
      data.warehouse_id,
      userId,
    );
    return {
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
    };
  };
}

export default InventoryService;
