import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map } from "rxjs/operators";
import { LocationBasic } from "../models/location_models/location-basic.model";

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
}