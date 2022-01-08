export class User {
  public id: number;
  public username: string;
  private _token: string;
  private _tokenExpDate: Date;

  constructor(id: number, username: string, token: string, exp: Date) {
    this.id = id;
    this.username = username;
    this._token = token;
    this._tokenExpDate = exp;
  }

  get token() {
    if (
      !this._token ||
      !this._tokenExpDate ||
      this._tokenExpDate < new Date()
    ) {
      return null;
    }
    return this._token;
  }
}
