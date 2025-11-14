import type { Express } from "express";
import AuthHandler from "./auth/handler";
import AuthRepository from "./auth/repository";
import { loginSchema } from "./auth/schema";
import AuthService from "./auth/service";
import connection from "./db";
import InventoryHandler from "./inventory/handler";
import InventoryRepository from "./inventory/repository";
import {
  createStockSchema,
  updateStockQuantitySchema,
  updateStockSchema,
} from "./inventory/schema";
import InventoryService from "./inventory/service";
import { logger } from "./lib/logger";
import { catchAllError } from "./middlewares/catchError";
import { setContext } from "./middlewares/context";
import { deserializeToken } from "./middlewares/deserializeToken";
import { logRequest } from "./middlewares/logger";
import { requestId } from "./middlewares/requestId";
import requiredLogin from "./middlewares/requiredLogin";
import sanitizeInput from "./middlewares/sanitizeInput";
import { validateInput } from "./middlewares/validateInput";
import OrgHandler from "./organzation/handler";
import OrgRepository from "./organzation/repository";
import OrgService from "./organzation/service";
import UserHandler from "./user/handler";
import UserRepository from "./user/repository";
import { createUserSchema } from "./user/schema";
import UserSerivce from "./user/service";
import WarehouseHandler from "./warehouse/handler";
import WarehouseRepository from "./warehouse/repository";
import { createWarehouseSchema } from "./warehouse/schema";
import WarehosueService from "./warehouse/service";
import { createOrgSchema, updateOrgSchema } from "./organzation/schema";

export default function routes(app: Express) {
  const authRepo = new AuthRepository(connection);
  const authService = new AuthService(authRepo);
  const authHandler = new AuthHandler(authService);

  const userRepo = new UserRepository(connection);
  const userService = new UserSerivce(userRepo);
  const userHandler = new UserHandler(userService);

  const warehosueRepo = new WarehouseRepository(connection);
  const warehouseService = new WarehosueService(warehosueRepo);
  const warehouseHandler = new WarehouseHandler(warehouseService);

  const inventoryRepo = new InventoryRepository(connection, logger);
  const inventoryService = new InventoryService(inventoryRepo, warehosueRepo);
  const inventoryHandler = new InventoryHandler(inventoryService);

  const orgRepo = new OrgRepository(connection, logger);
  const orgService = new OrgService(orgRepo, logger);
  const orgHandler = new OrgHandler(orgService);

  app.use(sanitizeInput);

  app.use(requestId);
  app.use(setContext);
  app.use(logRequest);
  app.post(
    "/api/register",
    //@ts-expect-error
    validateInput(createUserSchema),
    userHandler.registerUser,
  );
  app.post("/api/login", validateInput(loginSchema), authHandler.login);
  app.get("/api/refresh", authHandler.refreshToken);

  app.use(deserializeToken);
  app.use(requiredLogin);
  app.get("/api/users", userHandler.getCurrentUser);
  app.get("/api/users/:id", userHandler.getUserById);

  app.post(
    "/api/organizations",
    validateInput(createOrgSchema),
    orgHandler.create,
  );
  app.get("/api/organizations/:id", orgHandler.findById);
  app.put(
    "/api/organizations/:id",
    validateInput(updateOrgSchema),
    orgHandler.updateById,
  );
  app.delete("/api/organizations/:id", orgHandler.deleteById);

  app.post(
    "/api/stocks",
    validateInput(createStockSchema),
    inventoryHandler.createStock,
  );
  app.get("/api/stocks/:id", inventoryHandler.getStockById);
  app.put(
    "/api/stocks/:id",
    validateInput(updateStockSchema),
    inventoryHandler.updateStock,
  );
  app.delete("/api/stocks/:id", inventoryHandler.deleteStock);
  app.patch(
    "/api/stocks/:id",
    validateInput(updateStockQuantitySchema),
    inventoryHandler.updateStockQuantity,
  );

  app.post(
    "/api/warehouses",
    validateInput(createWarehouseSchema),
    warehouseHandler.createWarehouse,
  );
  app.put("/api/warehouses/:id", warehouseHandler.updateWarehouse);
  app.get("/api/warehouses/:id/stocks", warehouseHandler.getStockFromWarehouse);
  app.get("/api/warehouses", warehouseHandler.getWarehouses);
  app.delete("/api/warehouses/:id", warehouseHandler.deleteWarehouse);
  app.get(
    "/api/warehouses/stocks",
    warehouseHandler.getStocksFromAllWarehouses,
  );

  app.use(catchAllError);
}
