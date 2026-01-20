import { z } from "zod";

// ✅ Claim form validation (frontend)
export const claimSchema = z.object({
  verification_text: z
    .string()
    .trim()
    .min(15, "Please write at least 50 characters for verification.")
    .max(300, "Too long. Please keep it under 1000 characters."),

  // optional fields (you can keep or remove)
  verification_type: z.string().optional(),
  additional_context: z.string().optional(),

  // proof image is optional (validate file size/type lightly)
  proof_file: z
    .any()
    .optional()
    .refine(
      (file) => !file || file instanceof File,
      "Invalid file format."
    )
    .refine(
      (file) => !file || file.size <= 10 * 1024 * 1024,
      "File must be under 10MB."
    ),
});
