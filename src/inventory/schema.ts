import { z } from 'zod';

export type Stock = {
  id: number;
  name: string;
  total: number;
  created_at: string;
  updated_at: string;
};

export const createStockSchema = z.object({
  name: z
    .string({ required_error: 'name is required' })
    .min(1, 'name is required'),
  total: z
    .number({ required_error: 'total is required' })
    .min(1, 'total stock is required'),
});

export const updateStockSchema = z.object({
  name: z
    .string({ required_error: 'name is required' })
    .min(1, 'name is required'),
  total: z
    .number({ required_error: 'total is required' })
    .min(1, 'total stock is required'),
  updated_at: z.string({ required_error: 'updated_at is required' }),
});

export type CreateStock = z.TypeOf<typeof createStockSchema>;
export type UpdateStock = z.TypeOf<typeof updateStockSchema>;
