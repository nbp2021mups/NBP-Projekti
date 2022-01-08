export class PersonBasic{

    public id: string;
    public firstName: string;
    public lastName: string;
    public imageBlob: string;
    public username: string;
    public friends: string[] = [];  //pamtimo prijatelje kao niz id-eva
    public locations: string[] = [];    //pamtimo lokacije kao niz id-eva

    constructor(id: string, fName: string, lName: string, img: string, username: string, friends: string[], locations: string[]){
        this.id = id;
        this.firstName = fName;
        this.lastName = lName;
        this.imageBlob = img;
        this.username = username;
        this.friends = friends;
        this.locations = locations;
    }
}