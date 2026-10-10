export class AppError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const notFound = (message = "Not found") => new AppError(404, "not_found", message);
export const unauthorized = (message = "Authentication required") =>
  new AppError(401, "unauthorized", message);
export const conflict = (message: string) => new AppError(409, "conflict", message);
