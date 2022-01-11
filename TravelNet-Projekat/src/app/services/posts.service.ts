import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({providedIn: 'root'})
export class PostsService {

    constructor(private http: HttpClient) {}

    deletePost(postId: number) {
        return this.http.delete('http://localhost:3000/posts/' + postId,
        {
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

    /* unlikePost(userId: number, postId: number) {
        return this.http.delete('http://localhost:3000/likes/' + userId + '/' + postId);
    } */
}