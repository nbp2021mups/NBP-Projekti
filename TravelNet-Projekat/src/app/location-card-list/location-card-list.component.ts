import { Component, OnInit, Input } from '@angular/core';
import { LocationBasic } from '../models/location_models/location-basic.model';
import { AuthService } from '../services/authentication/auth.service';
import { LocationsService } from '../services/locations.service';

@Component({
  selector: 'app-location-card-list',
  templateUrl: './location-card-list.component.html',
  styleUrls: ['./location-card-list.component.css']
})
export class LocationCardListComponent implements OnInit {
  
  locations: {loc: LocationBasic, followed: boolean, postNo: number}[] = [];

  @Input()
  username: string;

  isLoading: boolean = false;

  constructor(private locService: LocationsService, private authService: AuthService) { }

  ngOnInit(): void {

    this.authService.user.subscribe(user => {
      this.isLoading = true;
      if(user.username == this.username) {
        this.locService.getPersonalLocations(this.username).subscribe(locs => {
          locs.forEach(loc => {
            this.locations.push({loc: loc.loc, followed: loc.followed, postNo: loc.postNo});
          });
          this.isLoading = false;
        });
      } else {
        this.locService.getUserLocations(this.username, user.username).subscribe(locs => {
          locs.forEach(loc => {
            this.locations.push({loc: loc.loc, followed: loc.followed, postNo: loc.postNo});
          });
          this.isLoading = false;
        });
      }

    }).unsubscribe();

  }

}
