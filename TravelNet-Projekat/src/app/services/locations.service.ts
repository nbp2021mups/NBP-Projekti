import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map } from "rxjs/operators";
import { LocationBasic } from "../models/location_models/location-basic.model";
import { LocationFull } from "../models/location_models/location-full.model";
import { PersonBasic } from "../models/person_models/person-basic.model";
import { PostHomePageModel } from "../models/post_models/post-homepage.model";

@Injectable({providedIn: 'root'})
export class LocationsService{

    constructor(private http: HttpClient) {}

    getAllLocations(){
        return this.http.get<any>('http://localhost:3000/locations/all-locations/')
        .pipe(map(locations => {
            const ret = [];
            locations.forEach(location => {
                ret.push(new LocationBasic(location.id, location.country, location.city));
            });
            return ret;
        }));
    }

    getLocation(idLoc: number, userId: number, limit: number) {
        return this.http.get<any>('http://localhost:3000/locations/' + idLoc + '/posts/' + userId + "/" + limit)
        .pipe(map(locationData => {
            const loc = new LocationFull(locationData.locationId, locationData.city, locationData.country, locationData.followersNo,
                locationData.postsNo, locationData.followByUser);
            locationData.posts.forEach(post => {
                loc.addPost(new PostHomePageModel(post.post.id, new PersonBasic(post.user.id, post.user.firstName,
                    post.user.lastName, post.user.image, post.user.username), new LocationBasic(locationData.locationId, locationData.country,
                        locationData.city), post.post.image, post.post.description, post.post.likeNo, post.post.commentNo, post.liked));
            });
            return loc;
        }));
    }


    followLocation(userId: number, locId: number) {
        return this.http.post('http://localhost:3000/locations/follow', 
        {
            userId: userId,
            locationId: locId
        }, {responseType: 'text'});
    }


    unfollowLocation(userId: number, locId: number) {
        return this.http.delete('http://localhost:3000/locations/' + userId + '/' + locId + "/unfollow",
        {
            responseType: 'text'
        });
    }


    getMoreLocationPosts(locId: number, loggedUser: string, skip: number, limit: number) {
        return this.http.get<any>('http://localhost:3000/posts/loadPostsLocation/' + locId + "/" + loggedUser + "/" + skip + "/" + limit)
        .pipe(map(respData => {
            const resp = [];
            respData.forEach(post => {
                resp.push(new PostHomePageModel(post.id, new PersonBasic(post.user.id, post.user.firstName, post.user.lastName,
                    post.user.image, post.user.username), null, post.image, post.desc, post.likeNo, post.commentNo, post.liked));
            });
            return resp;
        }));
    }



    getPersonalLocations(username: string) {
        return this.http.get<any>('http://localhost:3000/locations/personalLocations/' + username)
        .pipe(map(respData => {
            const ret = [];
            respData.forEach(resp => {
                ret.push({loc: new LocationBasic(resp.id, resp.country, resp.city), followed: true, postNo: resp.postNo});
            });
            return ret;
        }));
    }


    getUserLocations(username: string, logUser: string) {
        return this.http.get<any>('http://localhost:3000/locations/userLocations/' + username + '/' + logUser)
        .pipe(map(respData => {
            const ret = [];
            respData.forEach(resp => {
                ret.push({loc: new LocationBasic(resp.id, resp.country, resp.city), followed: resp.follows, postNo: resp.postNo});
            });
            return ret;
        }));
    }
}