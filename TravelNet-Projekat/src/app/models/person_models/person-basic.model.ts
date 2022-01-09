export class PersonBasic{

    public id: string;
    public firstName: string;
    public lastName: string;
    public imagePath: string;
    public username: string;

    constructor(id: string, fName: string, lName: string, img: string, username: string){
        this.id = id;
        this.firstName = fName;
        this.lastName = lName;
        this.imagePath = img;
        this.username = username;
    }
}