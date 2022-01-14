import { PersonBasic } from "./person-basic.model";

export class PersonProfile extends PersonBasic{
  public bio : string;
  public email : string;

  constructor(id : number, firstName : string, lastName : string, userName : string, image : string, bio : string, email : string){
    super(id, firstName, lastName, image, userName);
    this.bio = bio;
    this.email = email;
  }
}
