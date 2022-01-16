import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map } from "rxjs/operators";
import { PersonBasic } from "../models/person_models/person-basic.model";

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


    getFriends(username: string, loggedUser: string) {

        return this.http.get<any>('http://localhost:3000/friends/getUserFriends/' + loggedUser + '/' + username)
        .pipe(map(resp => {
            const ret = [];
            resp.forEach(user => {
                ret.push({user: new PersonBasic(user.id, user.fName, user.lName, user.image, user.username), status: user.status});
            });
            return ret;
        }));

    }


    getPersonalFriends(username: string) {
        return this.http.get<any>('http://localhost:3000/friends/personalFriends/' + username)
        .pipe(map(resp => {
            const ret = [];
            resp.forEach(user => {
                ret.push({user: new PersonBasic(user.id, user.fName, user.lName, user.image, user.username), status: 'friend'});
            });
            return ret;
        }));
    }


    getRecommendations(id: number) {
        return this.http.get<any>('http://localhost:3000/friends/recommendation/' + id)
        .pipe(map(resp => {
            const ret = [];
            resp.forEach(friend => {
                ret.push({person: new PersonBasic(friend.id, friend.firstName, friend.lastName, friend.image, friend.username),
                commonNum: friend.mutualFriends});
            });
            return ret;
        }));
    }


}