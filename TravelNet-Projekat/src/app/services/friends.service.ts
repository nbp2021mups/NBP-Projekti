import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({providedIn: 'root'})
export class FriendsService {

    constructor(private http: HttpClient) {}

    sendRequest(username1: string, username2: string) {
        return this.http.post('http://localhost:3000/friends/request', 
        {
            username1: username1,
            username2: username2
        },
        {responseType: 'text'});
    }

    //smatra se da je korisnik sa id1 poslao zahtev korisniku ciji je id2
    deleteRequest(username1: string, username2: string) {
        return this.http.delete('http://localhost:3000/friends/request',
        {
            body: {
                username1: username1,
                username2: username2
            },
            responseType: 'text'
        });
    }

    acceptRequest(id1: number, id2: number) {
        return this.http.post('http://localhost:3000/friends/accept', 
        {
            id1: id1,
            id2: id2
        },
        {responseType: 'text'});
    }

    deleteFriend(id1: number, id2: number) {
        return this.http.delete('http://localhost:3000/friends',
        {
            body: {
                id1: id1,
                id2: id2
            },
            responseType: 'text'
        });
    }
}