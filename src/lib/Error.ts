export class AuthCredentialError extends Error {
  constructor(message: string = 'username or password is incorrect') {
    super(message);
  }
}

export class UsernameAlreadyExistsError extends Error {
  constructor(message: string = 'this username already exists') {
    super(message);
  }
}
