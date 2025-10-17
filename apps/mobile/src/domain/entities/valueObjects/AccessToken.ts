export class AccessToken {
  private readonly accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  static create(accessToken: string): AccessToken {
    if (
      !accessToken ||
      accessToken.trim().length === 0 ||
      accessToken.length < 20
    ) {
      throw new Error("Invalid access token length");
    }

    return new AccessToken(accessToken);
  }

  toString() {
    return this.accessToken;
  }
}
