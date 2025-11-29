export class AppError extends Error {
  constructor(
    public code: number,
    public message: string,
  ) {
    super(message);
    this.code = code;
  }
}

export class AuthCredentialError extends AppError {
  constructor(
    message: string = "email or password is incorrect",
    code: number = 401,
  ) {
    super(code, message);
  }
}

export class EmailAlreadyExistsError extends AppError {
  constructor(
    message: string = "this email already exists",
    code: number = 409,
  ) {
    super(code, message);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string) {
    super(400, message);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, message);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(404, message);
  }
}
