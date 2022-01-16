import { Component, Input, OnInit } from '@angular/core';
import { PersonBasic } from 'src/app/models/person_models/person-basic.model';
import { AuthService } from 'src/app/services/authentication/auth.service';
import { FriendsService } from 'src/app/services/friends.service';
import { LocationsService } from 'src/app/services/locations.service';

@Component({
  selector: 'app-friends-list',
  templateUrl: './friends-list.component.html',
  styleUrls: ['./friends-list.component.css'],
})
export class FriendsListComponent implements OnInit {
  @Input()
  friends: { person: PersonBasic, status: string }[] = [];

  @Input()
  displayData: boolean = false;
  @Input()
  location: number = null;

  //username korisnika za koga ucitavamo prijatelje
  @Input()
  username: string;

  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private friendsService: FriendsService,
    private locService: LocationsService
  ) {}

  ngOnInit(): void {
    if (!this.displayData && !this.location) {
      this.authService.user
        .subscribe((user) => {
          this.isLoading = true;
          const loggedUser = user.username;
          if (this.username == loggedUser) {
            this.friendsService.getPersonalFriends(this.username).subscribe({
              next: (resp) => {
                resp.forEach((user) => {
                  this.friends.push({ person: user.user, status: user.status });
                });
                this.isLoading = false;
              },
              error: (err) => {
                console.log(err);
              },
            });
          } else {
            this.friendsService
              .getFriends(this.username, loggedUser)
              .subscribe({
                next: (resp) => {
                  resp.forEach((user) => {
                    this.friends.push({
                      person: user.user,
                      status: user.status,
                    });
                  });
                  this.isLoading = false;
                },
                error: (err) => {
                  console.log(err);
                },
              });
          }
        })
        .unsubscribe();
      } else if(this.location) {
          this.authService.user.subscribe(user => {
            this.locService.getLocationFollowers(this.location, user.username).subscribe({
              next: resp => {
                this.friends = resp;
              },
              error: err => {
                console.log(err);
                this.friends = [];              
              }
            });
          }).unsubscribe();
      }
  }

}
