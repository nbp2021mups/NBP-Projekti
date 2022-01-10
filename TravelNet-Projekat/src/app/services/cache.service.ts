import { Injectable } from "@angular/core";

@Injectable({providedIn: 'root'})
export class CacheService {
    public userClick: string[];

    handleClick(location: string){}

    startService() {
        setInterval(()=> {
            //obracanje serveru
        }, 10 * 60 * 100)
    }
}