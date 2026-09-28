import { ZodError } from "zod";

export function errorHandler(error, req, res, next) {
  console.error(error);

  // Validation errors
  if (error instanceof ZodError) {
    const errors = {};

    for (const issue of error.issues) {
      const field = issue.path.join(".");
      errors[field] = issue.message;
    }

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  // Application errors
  const statusCode = error.statusCode || 500;

  return res.status(statusCode).json({
    success: false,
    message: error.message || "Internal server error",
  });
}