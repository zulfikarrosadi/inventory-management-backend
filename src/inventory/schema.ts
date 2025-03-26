import { z } from 'zod';

export type Stock = {
  id: number;
  name: string;
  supplier: string;
  quantity: number;
  cost_price: number;
  purchase_date: number; // in ISO time
  stock_due_date: number; // in ISO time
  created_at: number; // in ISO time
  updated_at: number; // in ISO time
};

export const createStockSchema = z.object({
  name: z
    .string({ required_error: 'name is required' })
    .min(1, 'name is required'),
  supplier: z
    .string({ required_error: 'supplier is required' })
    .min(1, 'supplier is required'),
  quantity: z
    .number({ required_error: 'total is required' })
    .min(1, 'total stock is required'),
  cost_price: z
    .number({ required_error: 'cost price is required' })
    .min(1, 'cost price is required'),
  purchase_date: z.string({ required_error: 'purchase date is required' }),
  stock_due_date: z.string({ required_error: 'stock due date is required' }),
  created_at: z.string({ required_error: 'created at date is required' }),
  warehouse_id: z.number({ required_error: 'warehouse id is required' }),
});

export const updateStockSchema = z.object({
  name: z
    .string({ required_error: 'name is required' })
    .min(1, 'name is required'),
  supplier: z
    .string({ required_error: 'supplier is required' })
    .min(1, 'supplier is required'),
  quantity: z
    .number({ required_error: 'total is required' })
    .min(1, 'total stock is required'),
  cost_price: z
    .number({ required_error: 'cost price is required' })
    .min(1, 'cost price is required'),
  purchase_date: z.string({ required_error: 'purchase date is required' }),
  stock_due_date: z.string({ required_error: 'stock due date is required' }),
  updated_at: z.string({ required_error: 'updated_at is required' }),
  warehouse_id: z.number({ required_error: 'warehouse id is required' }),
});

// purchase_date, stock_due_date, and created_at input are date string typed
// we change it to number cause we'll save em as unix epoch
export type CreateStock = Omit<
  z.TypeOf<typeof createStockSchema>,
  'purchase_date' | 'stock_due_date' | 'created_at'
> & {
  purchase_date: number;
  stock_due_date: number;
  created_at: number;
};

// purchase_date, stock_due_date, and updated_at input are date string typed
// we change it to number cause we'll save em as unix epoch
export type UpdateStock = Omit<
  z.TypeOf<typeof updateStockSchema>,
  'purchase_date' | 'stock_due_date' | 'updated_at'
> & {
  purchase_date: number;
  stock_due_date: number;
  updated_at: number;
};
