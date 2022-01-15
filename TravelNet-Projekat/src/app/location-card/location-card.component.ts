import { Component, OnInit, Input } from '@angular/core';
import { LocationBasic } from '../models/location_models/location-basic.model';
import { AuthService } from '../services/authentication/auth.service';
import { LocationsService } from '../services/locations.service';

@Component({
  selector: 'app-location-card',
  templateUrl: './location-card.component.html',
  styleUrls: ['./location-card.component.css']
})
export class LocationCardComponent implements OnInit {

  constructor(private authService: AuthService, private locService: LocationsService) { }

  @Input()
  location: {loc: LocationBasic, followed: boolean, postNo: number}

  ngOnInit(): void {

  }

  onFollowClicked() {
    this.authService.user.subscribe(user => {
      const id = user.id;
      this.locService.followLocation(id, this.location.loc.id).subscribe({
        next: resp => {
          this.location.followed = true;
        },
        error: err => {console.log(err);}
      });
    });
  }


  onUnfollowClicked() {
    this.authService.user.subscribe(user => {
      const id = user.id;
      this.locService.unfollowLocation(id, this.location.loc.id).subscribe({
        next: resp => {
          this.location.followed = false;
        },
        error: err => {console.log(err);}
      });
    });
  }

}
