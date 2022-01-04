import { StringifyOptions } from "querystring";

export class LocationBasic{

    public id: string;
    public locName: string;

    constructor(id: string, locName: string){
        this.id = id;
        this.locName = locName;
    }
}