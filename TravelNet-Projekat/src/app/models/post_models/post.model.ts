import { PersonBasic } from "../person_models/person-basic.model";
import { LocationBasic } from "../location_models/location-basic.model";
import { LikeModel } from "./like.model";

export class PostModel{

    public id: string;  //id iz baze
    public person: PersonBasic;  //osnovne informacije o osobi koja je postavila sliku
    public location: LocationBasic;  //osnovne informacije o lokaciji na kojoj je slika slikana
    
    //moze i samo putanja
    public imageBlob: string;       //slika koja se cuva kao BLOB u bazi

    public likes: LikeModel[];
    //treba dodati komentare, mada i ne mora ovde

    constructor(id: string, person: PersonBasic, loc: LocationBasic, img: string, likes: LikeModel[]){
        this.id = id;
        this.person = person;
        this.location = loc;
        this.imageBlob = img;
        this.likes = likes;
    }
}