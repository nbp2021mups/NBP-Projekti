import { PersonBasic } from "./person-basic.model";

export class PersonFull extends PersonBasic{
    
    public email: string;

    constructor(id: string, fName: string, lName: string, img:string, friends: string[], locations: string[], email: string){
        super(id, fName, lName, img, friends, locations);
        this.email = email;
    }
}