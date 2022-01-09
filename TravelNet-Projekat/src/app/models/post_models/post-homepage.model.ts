import { PersonBasic } from "../person_models/person-basic.model";
import { LocationBasic } from "../location_models/location-basic.model";
import { PostModel } from "./post.model";

export class PostHomePageModel extends PostModel{

    public person: PersonBasic;  //osnovne informacije o osobi koja je postavila sliku
    public location: LocationBasic;  //osnovne informacije o lokaciji na kojoj je slika slikana

    constructor(id: string, person: PersonBasic, loc: LocationBasic, img: string, likesNo: number, commentsNo: number){
        super(id, img, likesNo, commentsNo);
        this.person = person;
        this.location = loc;
    }
}