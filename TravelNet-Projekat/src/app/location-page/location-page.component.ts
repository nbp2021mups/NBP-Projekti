import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { LocationFull } from '../models/location_models/location-full.model';
import { AuthService } from '../services/authentication/auth.service';
import { LocationsService } from '../services/locations.service';

@Component({
  selector: 'app-location-page',
  templateUrl: './location-page.component.html',
  styleUrls: ['./location-page.component.css']
})
export class LocationPageComponent implements OnInit {

  location: LocationFull;
  paramsSub: Subscription

  constructor(private route: ActivatedRoute, private locService: LocationsService, private authService: AuthService) { }

  ngOnInit(): void {
    this.paramsSub = this.route.params.subscribe(
      {
        next: params => {
          this.authService.user.subscribe(user => {
            const id = user.id;
            this.locService.getLocation(params['locationId'], id, 10).subscribe({
              next: resp => {
                this.location = resp;
              },
              error: err => {console.log(err);}
            });
          }).unsubscribe();
        },
        error: err => {console.log(err);}
      }
    );
  }


  onFollowLoc() {
    this.authService.user.subscribe(user => {
      const id = user.id;
      this.locService.followLocation(id, this.location.id).subscribe({
        next: resp => {
          alert(resp);
          this.location.followed = true;
        },
        error: err => {console.log(err);}
      });
    });
  }


  onUnfollowLoc() {
    this.authService.user.subscribe(user => {
      const id = user.id;
      this.locService.unfollowLocation(id, this.location.id).subscribe({
        next: resp => {
          alert(resp);
          this.location.followed = false;
        },
        error: err => {console.log(err);}
      });
    });
  }

}
