import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map } from "rxjs/operators";
import { LocationBasic } from "../models/location_models/location-basic.model";
import { PersonBasic } from "../models/person_models/person-basic.model";
import { PostHomePageModel } from "../models/post_models/post-homepage.model";

@Injectable({providedIn: 'root'})
export class HomepageService {

    constructor(private http: HttpClient) {}


    getHomePagePosts(username: string, skip: number, limit: number) {

        return this.http.get<any>('http://localhost:3000/homepage/' + username + '/' + skip + "/" + limit)
        .pipe(map(respData => {
            const ret = [];
            respData.forEach(resp => {
                ret.push(new PostHomePageModel(resp.post.id, new PersonBasic(resp.user.id, resp.user.fName, resp.user.lName,
                    resp.user.image, resp.user.username), new LocationBasic(resp.loc.id, resp.loc.country, resp.loc.city),
                    resp.post.image, resp.post.desc, resp.post.likeNo, resp.post.commentNo, resp.post.liked));
            });
            return ret;
        }));

    }

}