export class PostModel {
    public id: number;  //id iz baze
    public imagePath: string;  //slika koja se cuva kao BLOB u bazi
    public desc: string;
    public likesNo: number;
    public commentsNo: number;
    public liked: boolean;

    constructor(id: number, img: string, desc: string, likesNo: number, commentsNo: number, liked: boolean){
        this.id = id;
        this.imagePath = img;
        this.likesNo = likesNo;
        this.commentsNo = commentsNo;
        this.desc = desc;
        this.liked = liked;
    }
}