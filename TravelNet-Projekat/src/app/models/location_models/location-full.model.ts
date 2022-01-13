import { PostHomePageModel } from "../post_models/post-homepage.model";
import { LocationBasic } from "./location-basic.model"

export class LocationFull extends LocationBasic {

    public followersNo: number;
    public postsNo: number;
    public followed: boolean;
    public posts: PostHomePageModel[] = [];

    constructor(id: number, city: string, country: string, followNo: number, postNo: number, followed: boolean) {

        super(id, country, city);
        this.followersNo = followNo;
        this.postsNo = postNo;
        this.followed = followed;
    }

    addPost(post: PostHomePageModel): void {
        this.posts.push(post);
    }
}