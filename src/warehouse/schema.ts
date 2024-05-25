import { z } from 'zod';

export const createWarehouseSchema = z.object({
  name: z
    .string({ required_error: 'warehouse name is required' })
    .min(1, 'warehouse name is required'),
  address: z
    .string({ required_error: 'warehouse address is required' })
    .min(1, 'warehouse address is required'),
});

export type CreateWarehouse = z.TypeOf<typeof createWarehouseSchema>;
