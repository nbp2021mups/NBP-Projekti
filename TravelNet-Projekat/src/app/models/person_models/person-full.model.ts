import { PostHomePageModel } from "../post_models/post-homepage.model";
import { PersonBasic } from "./person-basic.model";

export class PersonFull extends PersonBasic{
    
    public email: string;
    public bio: string;
    public friendsNo: number;
    public postsNo: number;
    public followedLocNo: number;
    public posts: PostHomePageModel[] = [];

    constructor(id: number, fName: string, lName: string, img:string, username: string, email: string, bio: string, friendsNo: number,
        postsNo: number, followedLocNo: number){
        super(id, fName, lName, img, username);
        this.email = email;
        bio ? this.bio = bio : this.bio = "";
        this.friendsNo = friendsNo;
        this.postsNo = postsNo;
        this.followedLocNo = followedLocNo;
    }

    addPost(post: PostHomePageModel){
        this.posts.push(post);
    }
}