import { Express } from 'express';
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
import AuthRepository from './auth/repository';
import connection from './db';
import AuthService from './auth/service';
import AuthHandler from './auth/handler';
import UserRepository from './user/repository';
import UserSerivce from './user/service';
import UserHandler from './user/handler';

export default function routes(app: Express) {
  const authRepo = new AuthRepository(connection);
  const authService = new AuthService(authRepo);
  const authHandler = new AuthHandler(authService);

  const userRepo = new UserRepository(connection);
  const userService = new UserSerivce(userRepo);
  const userHandler = new UserHandler(userService);

  app.post(
    '/api/register',
    //@ts-ignore
    validateInput(createUserSchema),
    userHandler.registerUser,
  );
  app.post('/api/login', validateInput(loginSchema), authHandler.login);
  app.get('/api/refresh', authHandler.refreshToken);

  app.use(deserializeToken);
  app.use(requiredLogin);
  app.get('/api/users', userHandler.getCurrentUser);
  app.get('/api/users/:id', userHandler.getUserById);

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
