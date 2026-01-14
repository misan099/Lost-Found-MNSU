import { z } from "zod";

/* ===============================
   LOGIN SCHEMA
================================ */
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});

/* ===============================
   REGISTER SCHEMA
================================ */
export const registerSchema = z.object({
  fullname: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters"),

  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),

  securityQuestion: z
    .string()
    .trim()
    .min(1, "Security question is required"),

  securityAnswer: z
    .string()
    .trim()
    .min(1, "Security answer is required"),
});
