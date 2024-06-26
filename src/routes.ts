import { Express } from 'express';
import { getUser, registerUser, getCurrentUser } from './user/handler';
import { login, refreshToken } from './auth/handler';
import { validateInput } from './middlewares/validateInput';
import { createUserSchema } from './user/schema';
import { loginSchema } from './auth/schema';
import { deserializeToken } from './middlewares/deserializeToken';
import requiredLogin from './middlewares/requiredLogin';
import {
  createStock,
  deleteStock,
  getStockById,
  updateStock,
} from './inventory/handler';
import { createStockSchema, updateStockSchema } from './inventory/schema';
import { createWarehouseSchema } from './warehouse/schema';
import {
  createWarehouse,
  getWarehouses,
  getStocksFromWarehouse,
  updateWarehouse,
  deleteWarehouse,
  getStocksFromAllWarehouses,
} from './warehouse/handler';

export default function routes(app: Express) {
  app.post('/api/register', validateInput(createUserSchema), registerUser);
  app.post('/api/login', validateInput(loginSchema), login);
  app.get('/api/refresh', refreshToken);

  app.use(deserializeToken);
  app.use(requiredLogin);
  app.get('/api/users', getCurrentUser);
  app.get('/api/users/:id', getUser);

  app.post('/api/stocks', validateInput(createStockSchema), createStock);
  app.get('/api/stocks/:id', getStockById);
  app.put('/api/stocks/:id', validateInput(updateStockSchema), updateStock);
  app.delete('/api/stocks/:id', deleteStock);

  app.post(
    '/api/warehouses',
    validateInput(createWarehouseSchema),
    createWarehouse,
  );
  app.put('/api/warehouses/:id', updateWarehouse);
  app.get('/api/warehouses/:id/stocks', getStocksFromWarehouse);
  app.get('/api/warehouses', getWarehouses);
  app.delete('/api/warehouses/:id', deleteWarehouse);
  app.get('/api/warehouses/stocks', getStocksFromAllWarehouses);
}
