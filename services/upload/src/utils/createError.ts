interface ApiError extends Error {
  status: number,
  message: string
}

class ApiError extends Error implements ApiError {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.message = message;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

// Error handler
export function createError(status: number, message: string): ApiError {
    const err = new ApiError(status, message);
    return err;
}

