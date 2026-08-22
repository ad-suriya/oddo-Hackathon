export class AppError extends Error {
  constructor(message, { status = 500, code = "INTERNAL_ERROR", details = {} } = {}) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export class ValidationError extends AppError {
  constructor(message = "Please fix the highlighted fields.", details = {}) {
    super(message, { status: 422, code: "VALIDATION_ERROR", details });
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required.") {
    super(message, { status: 401, code: "UNAUTHENTICATED" });
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "You do not have permission to perform this action.") {
    super(message, { status: 403, code: "FORBIDDEN" });
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found.") {
    super(message, { status: 404, code: "NOT_FOUND" });
  }
}

export class ConflictError extends AppError {
  constructor(message = "This resource already exists.") {
    super(message, { status: 409, code: "CONFLICT" });
  }
}
