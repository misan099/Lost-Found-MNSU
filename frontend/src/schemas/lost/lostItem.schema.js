import { z } from "zod";

/* ===============================
   LOST ITEM SCHEMA
================================ */
export const lostItemSchema = z.object({
  item_name: z
    .string()
    .trim()
    .min(2, "Item name must be at least 2 characters"),

  category: z
    .string()
    .trim()
    .min(1, "Please select a category"),

  area: z
    .string()
    .trim()
    .min(1, "Area is required"),

  exact_location: z
    .string()
    .trim()
    .min(1, "Exact location is required"),

  date_lost: z
    .string()
    .min(1, "Date lost is required")
    .refine((val) => !isNaN(Date.parse(val)), "Invalid date format"),

  time_lost: z
    .string()
    .trim()
    .refine(
      (val) => !val || /^\d{2}:\d{2}$/.test(val),
      "Invalid time format"
    ),

  public_description: z
    .string()
    .trim()
    .min(10, "Public description must be at least 10 characters"),

  admin_verification_details: z
    .string()
    .trim()
    .min(20, "Admin verification details must be at least 20 characters"),

  hidden_marks: z
    .string()
    .optional()
    .or(z.literal("")),

  verification_notes: z
    .string()
    .optional()
    .or(z.literal("")),
});

/* ===============================
   VALIDATION HELPER
================================ */
export const validateLostItem = (data) => {
  try {
    lostItemSchema.parse(data);
    return { success: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = {};
      error.issues.forEach((err) => {
        const field = err.path[0];
        formattedErrors[field] = err.message;
      });
      return { success: false, errors: formattedErrors };
    }
    return { success: false, errors: { general: "Validation failed" } };
  }
};
