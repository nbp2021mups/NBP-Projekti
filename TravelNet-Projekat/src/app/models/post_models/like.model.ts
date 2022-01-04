export class LikeModel {

    public id: string;
    public likePersonId: string;

    constructor(id: string, personId: string){
        this.id = id;
        this.likePersonId = personId;
    }
}