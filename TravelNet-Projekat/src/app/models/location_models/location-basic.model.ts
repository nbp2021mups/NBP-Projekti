import { StringifyOptions } from "querystring";

export class LocationBasic{

    public id: number;
    public country: string;
    public city: string;

    constructor(id: number, country: string, city: string){
        this.id = id;
        this.country = country;
        this.city = city;
    }
}