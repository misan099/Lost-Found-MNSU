// utils/auth/zodError.js
export function mapZodErrors(zodError) {
  const errors = {};

  // ✅ Defensive check (VERY IMPORTANT)
  if (!zodError?.issues) return errors;

  zodError.issues.forEach(issue => {
    const field = issue.path[0];
    errors[field] = issue.message;
  });

  return errors;
}
