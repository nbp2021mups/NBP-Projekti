export class User{
    public id: number;
    private _token :string;
    private _tokenExpDate: Date

    constructor(id: number, token: string, exp: Date){
        this.id = id;
        this._token = token;
        this._tokenExpDate = exp;
    }

    get token() {
        if(!this._token || !this._tokenExpDate || this._tokenExpDate < new Date()){
            return null;
        }
        return this._token;
    }
}