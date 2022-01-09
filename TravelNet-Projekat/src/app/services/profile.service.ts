import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map } from "rxjs/operators";
import { PersonFull } from "../models/person_models/person-full.model";
import { PostHomePageModel } from "../models/post_models/post-homepage.model";
import { PostModel } from "../models/post_models/post.model";

@Injectable({providedIn : 'root'})
export class ProfileService{

    constructor(private http: HttpClient) {}

    getLoggedUserProfileInfo(username: string) {
        return this.http.get<any>('http://localhost:3000/users/profile' + username)
        .pipe(map(respData => {
            const person = new PersonFull(respData.id, respData.firstName, respData.lastName, respData.image, respData.useraname,
                respData.email, respData.bio, respData.friendsNo, respData.postsNo, respData.followedLocNo);

            respData.posts.forEach(post => {
                //person.addPost(new PostHomePageModel())
            });
        }));
    }

    getOtherUserProfileInfo(username: string, postLimit: number) {

    }
}