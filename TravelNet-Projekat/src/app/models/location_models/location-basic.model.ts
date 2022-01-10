import { StringifyOptions } from "querystring";

export class LocationBasic{

    public id: string;
    public country: string;
    public city: string;

    constructor(id: string, country: string, city: string){
        this.id = id;
        this.country = country;
        this.city = city;
    }
}