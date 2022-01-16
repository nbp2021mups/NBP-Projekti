import { Component, OnDestroy, OnInit } from '@angular/core';
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
export class LocationPageComponent implements OnInit, OnDestroy {

  location: LocationFull;
  paramsSub: Subscription;
  allRead: boolean = false;
  pageSize: number = 6;
  isLoading: boolean = false;
  toggleFriends: boolean = false;

  constructor(private route: ActivatedRoute, private locService: LocationsService, private authService: AuthService) { }

  ngOnInit(): void {
    this.paramsSub = this.route.params.subscribe(
      {
        next: params => {
          this.isLoading = true;
          this.authService.user.subscribe(user => {
            const id = user.id;
            this.locService.getLocation(+params['locationId'], id, this.pageSize).subscribe({
              next: resp => {
                this.location = resp;
                this.isLoading = false;
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
          this.location.followed = true;
          this.location.followersNo++;
        },
        error: err => {console.log(err);}
      });
    });
  }


  loadMore(event) {
    this.authService.user.subscribe(user => {
      const loggedU = user.username;
      this.locService.getMoreLocationPosts(this.location.id, loggedU, this.location.posts.length, this.pageSize).subscribe({
        next: resp => {
          if(resp.length == 0){
            this.allRead = true;
            return;
          }
          resp.forEach(post => {
            post.setLocation(this.location);
          });
          this.location.posts = this.location.posts.concat(resp);
          setTimeout(() => {
            window.scrollTo({
              top: event.clientY + 550,
              left: 0,
              behavior: 'smooth'
            })
          }, 1);
        },
        error: err => {console.log(err);}
      });
    }).unsubscribe();
  }


  onUnfollowLoc() {
    this.authService.user.subscribe(user => {
      const id = user.id;
      this.locService.unfollowLocation(id, this.location.id).subscribe({
        next: resp => {
          this.location.followed = false;
          this.location.followersNo--;
        },
        error: err => {console.log(err);}
      });
    });
  }

  onFollowers() {
    this.toggleFriends = !this.toggleFriends;
  }


  ngOnDestroy(): void {
      this.paramsSub.unsubscribe();
  }
}
