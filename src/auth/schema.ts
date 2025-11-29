import { z } from "zod";

export type LoginResult = {
  id: number;
  email: string;
};

export const loginSchema = z.object({
  email: z
    .string({ required_error: "email is required" })
    .min(1, "email is required"),
  password: z
    .string({ required_error: "password is required" })
    .min(1, "password is required"),
});

export type Login = z.TypeOf<typeof loginSchema>;
