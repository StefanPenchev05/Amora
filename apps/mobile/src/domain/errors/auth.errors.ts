export class InvalidCredentialsError extends Error {
  constructor(msg = "Invalid email or password") {
    super(msg);
    this.name = "InvalidCredentialsError";
  }
}

export class EmailAlreadyUsedError extends Error {
  constructor(msg = "Email already in use") {
    super(msg);
    this.name = "EmailAlreadyUsedError";
  }
}

export class NetworkOrServerError extends Error {
  constructor(msg = "Network or server error") {
    super(msg);
    this.name = "NetworkOrServerError";
  }
}
