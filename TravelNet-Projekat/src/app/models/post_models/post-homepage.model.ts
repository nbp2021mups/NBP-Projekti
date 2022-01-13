import { PersonBasic } from "../person_models/person-basic.model";
import { LocationBasic } from "../location_models/location-basic.model";
import { PostModel } from "./post.model";

export class PostHomePageModel extends PostModel{

    public person: PersonBasic;  //osnovne informacije o osobi koja je postavila sliku
    public location: LocationBasic;  //osnovne informacije o lokaciji na kojoj je slika slikana

    constructor(id: number, person: PersonBasic, loc: LocationBasic, img: string, desc:string, likesNo: number, commentsNo: number, liked: boolean){
        super(id, img, desc, likesNo, commentsNo, liked);
        this.person = person;
        this.location = loc;
    }

    setPerson(person: PersonBasic){
        this.person = person;
    }
}