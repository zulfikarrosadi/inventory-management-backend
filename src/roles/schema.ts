import { z } from "zod";

export type CreateRoleResult = {
  id: number;
  name: string;
  description?: string;
  permission: {
    id: number;
    slug: string;
  }[];
};

export type AddRoleUserResult = {
  /**
   * user id
   */
  id: number[];
  role_id: number;
  role_name: string;
  role_description?: string;
  warehouse_id: number;
};

export type UpdateUserRoleResult = {
  /**
   * user id
   */
  id: number;
  role_id: number;
  role_name: string;
  role_description?: string;
  warehouse_id: number;
};

export const createRoleSchema = z.object({
  role_name: z
    .string({
      required_error: "role name is required",
      invalid_type_error: "role name should be valid string",
    })
    .trim()
    .min(1, "role name is required")
    .max(255, "role name should be less than 255 characters"),
  role_description: z
    .string({ invalid_type_error: "role description should be valid string" })
    .trim()
    .max(255, "role description sould be less than 255 characters"),
  permission_id: z.array(
    z.number({ required_error: "role permissions is required" }),
  ),
  org_id: z.number({ required_error: "organization information is required" }),
});

export const addRoleUserSchema = z.object({
  email: z.array(
    z
      .string({
        required_error: "email is required",
        invalid_type_error: "email should be valid string",
      })
      .trim()
      .min(1, "email is required")
      .max(255, "email should be less than 255 character"),
  ),
  role_id: z.number({
    invalid_type_error: "role id should be valid number",
    required_error: "role id is required",
  }),
  warehouse_id: z.number({
    invalid_type_error: "warehouse id should be valid number",
    required_error: "warehouse id is required",
  }),
});

export const updateUserRoleSchema = z.object({
  email: z.string({ required_error: "user email is required" }).trim(),
  prev_role_id: z.number({ required_error: "previous role id is required" }),
  new_role_id: z.number({ required_error: "new user role id is required" }),
  warehouse_id: z.number({ required_error: "warehouse is required" }),
});

export const deleteUserRoleSchema = z.object({
  email: z.string({ required_error: "user email is required" }).trim(),
  role_id: z.number({ required_error: "role id is required" }),
  warehouse_id: z.number({ required_error: "warehouse id is required" }),
});

export type CreateRole = z.infer<typeof createRoleSchema>;
export type AddRoleUser = z.infer<typeof addRoleUserSchema>;
export type UpdateUserRole = z.infer<typeof updateUserRoleSchema>;
export type DeleteUserRole = z.infer<typeof deleteUserRoleSchema>;
