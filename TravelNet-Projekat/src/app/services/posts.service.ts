import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map } from "rxjs/operators";
import { LocationBasic } from "../models/location_models/location-basic.model";
import { PersonBasic } from "../models/person_models/person-basic.model";
import { PostHomePageModel } from "../models/post_models/post-homepage.model";

@Injectable({providedIn: 'root'})
export class PostsService {

    constructor(private http: HttpClient) {}

    deletePost(postId: number, imagePath: string) {
        return this.http.delete('http://localhost:3000/posts/' + postId,
        {
            body: {imagePath: imagePath},
            responseType: 'text'
        });
    }

    updateDescription(postId: number, description: string){
        return this.http.patch('http://localhost:3000/posts/' + postId,
            {newDescription: description},
            {responseType : 'text'}
        );
    }

    likePost(userId: number, postId: number) {
        return this.http.post('http://localhost:3000/likes',
            {
                userId: userId,
                postId: postId
            },
            {responseType: 'text'}
        );
    }

    unlikePost(userId: number, postId: number) {
        return this.http.delete('http://localhost:3000/likes/' + userId + '/' + postId,
        {
            body: {
                userId: userId,
                postId: postId
            },
            responseType: 'text'
        });
    }


    loadMoreProfilePosts(otherUser: string, loggedUser: string, skip: number, limit: number) {
        return this.http.get<any>('http://localhost:3000/posts/loadPosts/' + otherUser + '/' + loggedUser + '/' + skip + '/' + limit)
        .pipe(map(posts => {
            const parsedPosts = [];
            posts.forEach(post => {
                parsedPosts.push(new PostHomePageModel(post.id, null, new LocationBasic(post.loc.id, post.loc.country,
                    post.loc.city), post.image, post.desc, post.likeNo, post.commentNo, post.liked));
            });
            return parsedPosts;
        }));
    }


    getExplorePosts(id: number, skip: number, limit: number) {
        return this.http.get<any>('http://localhost:3000/explorepage/' + id + "/" + skip + "/" + limit)
        .pipe(map(respData => {
            const ret = [];
            respData.forEach(post => {
                ret.push(new PostHomePageModel(post.post.id, new PersonBasic(post.user.id, post.user.firstName, 
                    post.user.lastName, post.user.image, post.user.username), new LocationBasic(post.location.id,
                        post.location.country, post.location.city), post.post.image, post.post.description, post.post.likeNo,
                        post.post.commentNo, post.post.liked));
            });
            return ret;
        }));
    }
}