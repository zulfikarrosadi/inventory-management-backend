import { z } from "zod";

export type Org = {
  id: number;
  name: string;
  address?: string;
  version?: number;
};

export type FindByIdResult = {
  id: number;
  name: string;
  address?: string;
  version: number;
};

export const createOrgSchema = z.object({
  name: z
    .string({
      required_error: "organization name is required",
      invalid_type_error: "orgnaization name should be string",
    })
    .trim()
    .min(1, "organization name is required")
    .max(255, "organization name should less than 255 characters"),
  address: z
    .string({
      required_error: "address name is required",
      invalid_type_error: "address name should be string",
    })
    .trim()
    .optional(),
});

export type CreateOrg = z.infer<typeof createOrgSchema>;

export const updateOrgSchema = z.object({
  name: z
    .string({
      required_error: "organization name is required",
      invalid_type_error: "orgnaization name should be string",
    })
    .trim()
    .min(1, "organization name is required")
    .max(255, "organization name should less than 255 characters"),
  address: z
    .string({
      invalid_type_error: "address name should be string",
    })
    .trim()
    .optional(),
});

export type UpdateOrg = z.infer<typeof updateOrgSchema>;
