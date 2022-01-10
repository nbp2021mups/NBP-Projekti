import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map } from "rxjs/operators";
import { LocationBasic } from "../models/location_models/location-basic.model";
import { PersonBasic } from "../models/person_models/person-basic.model";
import { PersonFull } from "../models/person_models/person-full.model";
import { PostHomePageModel } from "../models/post_models/post-homepage.model";

@Injectable({providedIn : 'root'})
export class ProfileService{

    constructor(private http: HttpClient) {}

    getLoggedUserProfileInfo(username: string) {
        return this.http.get<any>('http://localhost:3000/users/profile/' + username)
        .pipe(map(respData => {
            const person = new PersonFull(respData.id, respData.firstName, respData.lastName, respData.image, respData.username,
                respData.email, respData.bio, respData.friendsNo, respData.postsNo, respData.followedLocationsNo);

            if(respData.posts != null && respData.posts.length > 0){
                respData.posts.forEach(post => {
                    person.addPost(new PostHomePageModel(post.id, new PersonBasic(respData.id, respData.firstName, respData.lastName,
                        respData.image, respData.username), new LocationBasic(post.location.id, post.location.country, post.location.city), post.image,
                        post.description, post.likeNo, post.commentNo, false));
                });
            }
            return person;
        }));
    }

    getOtherUserProfileInfo(loggedUser: string, username: string, postLimit: number) {
        return this.http.get<any>('http://localhost:3000/users/profile/' + loggedUser + "/" + username + "/" + postLimit)
        .pipe(map(respData => {
            const person = new PersonFull(respData.id, respData.firstName, respData.lastName, respData.image, respData.username,
                respData.email, respData.bio, respData.friendsNo, respData.postsNo, respData.followedLocationsNo);

            if (respData.posts == null) {
                person.posts = null;
            }
            else {
                respData.posts.forEach(post => {
                    person.addPost(new PostHomePageModel(post.id, new PersonBasic(respData.id, respData.firstName, respData.lastName,
                        respData.image, respData.username), new LocationBasic(post.location.id, post.location.country, post.location.city), post.image,
                        post.description, post.likeNo, post.commentNo, post.like));
                });
            }
            return {person: person, relation: respData.relation};
        }));
    }
}