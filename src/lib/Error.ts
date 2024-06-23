export class AuthCredentialError extends Error {
  constructor(message: string = 'username or password is incorrect') {
    super(message);
  }
}
