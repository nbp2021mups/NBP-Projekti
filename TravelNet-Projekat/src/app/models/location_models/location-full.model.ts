import { PostHomePageModel } from "../post_models/post-homepage.model";
import { LocationBasic } from "./location-basic.model"

export class LocationFull extends LocationBasic {

    public followersNo: number;
    public postsNo: number;
    public posts: PostHomePageModel[] = [];

    constructor(id: number, city: string, country: string, followNo: number, postNo: number) {

        super(id, country, city);
        this.followersNo = followNo;
        this.postsNo = postNo;

    }
}