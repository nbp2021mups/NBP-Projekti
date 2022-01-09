export class PostModel {
    public id: string;  //id iz baze
    public imagePath: string;  //slika koja se cuva kao BLOB u bazi
    public likesNo: number;
    public commentsNo: number;

    constructor(id: string, img: string, likesNo: number, commentsNo: number){
        this.id = id;
        this.imagePath = img;
        this.likesNo = likesNo;
        this.commentsNo = commentsNo;
    }
}