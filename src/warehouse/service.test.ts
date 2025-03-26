import { NotFoundError } from '../lib/Error';
import WarehouseRepository from './repository';
import WarehosueService from './service';

describe('warehouse service', () => {
  let repo: jest.Mocked<WarehouseRepository>;
  let service: WarehosueService;
  const VALID_USER_ID = 1;
  const USER_WITH_NO_WAREHOUSE = 0;
  const VALID_CREATE_WAREHOUSE_DATA = {
    name: 'gudang a',
    address: 'pulau pisang',
  };
  const VALID_UPDATE_WAREHOUSE_DATA = {
    name: 'gudang b',
    address: 'pulau legundi',
  };
  const VALID_STOCK = {
    id: 1,
    name: 'test',
    cost_price: 1000,
    created_at: '2024-10-10',
    purchase_date: '2024-10-01',
    quantity: 100,
    stock_due_date: '2024-10-15',
    supplier: 'indomart',
    updated_at: '2024-10-02',
  };
  const VALID_WAREHOUSE_ID = 1;
  const INVALID_WAREHOUSE_ID = 0;

  beforeEach(() => {
    repo = {
      findWarehouses: jest.fn(),
      saveWarehouse: jest.fn(),
      findWarehouseById: jest.fn(),
      updateWarehouseById: jest.fn(),
      deleteWarehouseById: jest.fn(),
      findStockFromWarehouse: jest.fn(),
      findStocksFromAllWarehouses: jest.fn(),
    } as unknown as jest.Mocked<WarehouseRepository>;

    service = new WarehosueService(repo);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('get all warehouses', () => {
    it('should return warehouses', async () => {
      repo.findWarehouses.mockResolvedValue([
        { id: 1, address: 'jakarta', name: 'gudang a' },
      ]);

      const result = await service.getWarehouses(VALID_USER_ID);

      expect(result.status).toBe('success');
      expect(result.data.warehouses).toHaveLength(1);
    });

    it("should return 404 cause user don't have any warehouse yet", async () => {
      repo.findWarehouses.mockRejectedValue(
        new NotFoundError('no warehouse found, create new warehouse to start'),
      );
      const result = await service.getWarehouses(USER_WITH_NO_WAREHOUSE);

      expect(repo.findWarehouses).toHaveBeenCalledWith<number[]>(
        USER_WITH_NO_WAREHOUSE,
      );
      expect(result.status).toBe('fail');
      expect(result.errors?.code).toBe(404);
      expect(result.errors?.message).toBe(
        'no warehouse found, create new warehouse to start',
      );
    });
  });

  describe('create warehouse', () => {
    it('should return error 500 cause inserting data to db is fail', async () => {
      repo.saveWarehouse.mockRejectedValueOnce(
        'something went wrong, please try again',
      );

      const result = await service.createWarehouse(
        VALID_CREATE_WAREHOUSE_DATA,
        VALID_USER_ID,
      );

      expect(result.status).toBe('fail');
      expect(repo.saveWarehouse).toHaveBeenCalledWith<
        [{ name: string; address: string }, number]
      >(VALID_CREATE_WAREHOUSE_DATA, VALID_USER_ID);
      expect(result.errors?.message).toBe(
        'something went wrong, please try again',
      );
      expect(result.errors?.code).toBe(500);
    });

    it('should success', async () => {
      repo.saveWarehouse.mockResolvedValueOnce({ warehouseId: 1 });
      repo.findWarehouses.mockResolvedValueOnce([
        { id: 1, ...VALID_CREATE_WAREHOUSE_DATA },
      ]);

      const result = await service.createWarehouse(
        VALID_CREATE_WAREHOUSE_DATA,
        1,
      );

      expect(result.status).toBe('success');
      expect(repo.saveWarehouse).toHaveBeenCalledWith<
        [{ name: string; address: string }, number]
      >(VALID_CREATE_WAREHOUSE_DATA, VALID_USER_ID);
      expect(result.data?.warehouses).toHaveLength(1);
    });
  });

  describe('update warehouse', () => {
    it('should return error 500 caused db error', async () => {
      repo.updateWarehouseById.mockRejectedValueOnce(
        'something went wrong, enter correct data and please try again',
      );

      const result = await service.updateWarehouse(
        VALID_WAREHOUSE_ID,
        VALID_USER_ID,
        VALID_UPDATE_WAREHOUSE_DATA,
      );

      expect(repo.updateWarehouseById).toHaveBeenCalledWith<
        [number, number, { name: string; address: string }]
      >(VALID_WAREHOUSE_ID, VALID_USER_ID, VALID_UPDATE_WAREHOUSE_DATA);
      expect(result.status).toBe('fail');
      expect(result).toHaveProperty('errors');
      expect(result.errors).toHaveProperty('code');
      expect(result.errors).toHaveProperty('message');
      expect(result.errors?.code).toBe(500);
      expect(result.errors?.message).toBe(
        'something went wrong, enter correct data and please try again',
      );
    });

    it('should succses', async () => {
      repo.updateWarehouseById.mockResolvedValueOnce({ affectedRows: 1 });
      repo.findWarehouseById.mockResolvedValueOnce({
        id: 1,
        ...VALID_UPDATE_WAREHOUSE_DATA,
      });

      const result = await service.updateWarehouse(
        VALID_WAREHOUSE_ID,
        VALID_USER_ID,
        VALID_UPDATE_WAREHOUSE_DATA,
      );

      expect(repo.updateWarehouseById).toHaveBeenCalledWith<
        [number, number, { name: string; address: string }]
      >(VALID_WAREHOUSE_ID, VALID_USER_ID, VALID_UPDATE_WAREHOUSE_DATA);
      expect(repo.findWarehouseById).toHaveBeenCalledWith<[number, number]>(
        VALID_WAREHOUSE_ID,
        VALID_USER_ID,
      );
      expect(result.status).toBe('success');
      expect(result).toHaveProperty('data');
      expect(result.data).toHaveProperty('warehouses');
      expect(result.data.warehouses.id).toBe(1);
      expect(result.data.warehouses.name).toBe(
        VALID_UPDATE_WAREHOUSE_DATA.name,
      );
      expect(result.data.warehouses.address).toBe(
        VALID_UPDATE_WAREHOUSE_DATA.address,
      );
    });
  });

  describe('find stock from warehouse', () => {
    it('should return 404 cause no stock found in a warehouse', async () => {
      repo.findStockFromWarehouse.mockRejectedValueOnce(
        'this warehouse is empty',
      );

      const result = await service.findStockFromWarehouse(
        VALID_WAREHOUSE_ID,
        VALID_USER_ID,
      );

      expect(repo.findStockFromWarehouse).toHaveBeenCalledWith<
        [number, number]
      >(VALID_WAREHOUSE_ID, VALID_USER_ID);
      expect(result.status).toBe('fail');
      expect(result).toHaveProperty('errors');
      expect(result.errors).toHaveProperty('message');
      expect(result.errors).toHaveProperty('code');
      expect(result.errors?.message).toBe('this warehouse is empty');
      expect(result.errors?.code).toBe(404);
    });

    it('should success', async () => {
      repo.findStockFromWarehouse.mockResolvedValueOnce([VALID_STOCK]);
      repo.findWarehouseById.mockResolvedValueOnce({
        id: 1,
        ...VALID_CREATE_WAREHOUSE_DATA,
      });
      const result = await service.findStockFromWarehouse(
        VALID_WAREHOUSE_ID,
        VALID_USER_ID,
      );

      expect(result.status).toBe('success');
      expect(result).toHaveProperty('data');
      expect(result.data).toHaveProperty('warehouses');
      expect(result.data).toHaveProperty('stocks');
      expect(result.data.stocks).toHaveLength(1);
      expect(result.data.stocks[0].id).toBe(VALID_STOCK.id);
    });
  });

  describe('delete warehouse', () => {
    it('should return 400 error cause delete process failed, either caused by user or system', async () => {
      repo.deleteWarehouseById.mockRejectedValueOnce(
        'fail to delete this warehouse, please enter the correct information and try again',
      );

      const result = await service.deleteWarehouse(
        INVALID_WAREHOUSE_ID,
        VALID_USER_ID,
      );

      expect(repo.deleteWarehouseById).toHaveBeenCalledWith<[number, number]>(
        INVALID_WAREHOUSE_ID,
        VALID_USER_ID,
      );
      expect(result.status).toBe('fail');
      expect(result).toHaveProperty('errors');
      expect(result.errors).toHaveProperty('message');
      expect(result.errors).toHaveProperty('code');
      expect(result.errors?.code).toBe(400);
      expect(result.errors?.message).toBe(
        'fail to delete this warehouse, please enter the correct information and try again',
      );
    });

    it('should success', async () => {
      repo.deleteWarehouseById.mockResolvedValueOnce({ affectedRows: 1 });

      const result = await service.deleteWarehouse(
        VALID_WAREHOUSE_ID,
        VALID_USER_ID,
      );

      expect(repo.deleteWarehouseById).toHaveBeenCalledWith<[number, number]>(
        VALID_WAREHOUSE_ID,
        VALID_USER_ID,
      );
      expect(result.status).toBe('success');
    });
  });

  describe('find stock from all warehouses', () => {
    it('should return 404 cause no warehouse and stock are found', async () => {
      repo.findStocksFromAllWarehouses.mockRejectedValueOnce(
        'no warehouses and stocks are found',
      );

      const result = await service.findStockFromAllWarehouses(VALID_USER_ID);
      expect(repo.findStocksFromAllWarehouses).toHaveBeenCalledWith<[number]>(
        VALID_USER_ID,
      );
      expect(result.status).toBe('fail');
      expect(result).toHaveProperty('errors');
      expect(result.errors).toHaveProperty('message');
      expect(result.errors).toHaveProperty('code');
      expect(result.errors?.code).toBe(404);
      expect(result.errors?.message).toBe('no warehouses and stocks are found');
    });

    it('should success', async () => {
      repo.findStocksFromAllWarehouses.mockResolvedValueOnce([
        {
          warehouse_id: 1,
          warehouse_name: 'gudang a',
          warehouse_address: 'pulau pisang',
          ...VALID_STOCK,
        },
      ]);
      const result = await service.findStockFromAllWarehouses(VALID_USER_ID);

      expect(repo.findStocksFromAllWarehouses).toHaveBeenCalledWith<[number]>(
        VALID_USER_ID,
      );

      expect(result.status).toBe('success');
      expect(result.data.warehouses).toHaveLength(1);
      expect(result.data.warehouses[0].stocks).toHaveLength(1);
    });
  });
});
