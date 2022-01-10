import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs';
import { PersonFull } from '../models/person_models/person-full.model';
import { AuthService } from '../services/authentication/auth.service';
import { ProfileService } from '../services/profile.service';

export enum ProfileType {
  personal = 1,
  friend = 2,
  non_friend = 3,
  sent_req = 4,
  rec_req = 5
};

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.css']
})

export class ProfilePageComponent implements OnInit, OnDestroy {

  person: PersonFull;
  loggedUserSub: Subscription;
  profileType: ProfileType;

  constructor(private authService: AuthService, private route: ActivatedRoute, private profileService: ProfileService) { }

  ngOnInit(): void {
    this.route.params.subscribe({
      next: (params: Params) => {
        const username = params['username'];
        this.loggedUserSub = this.authService.user.subscribe(user => {
          if(!user){ return;}
          const loggedUser = user.username;
          if(username == loggedUser) {
            this.profileType = ProfileType.personal;
            this.profileService.getLoggedUserProfileInfo(loggedUser).subscribe(user => {
              this.person = user;
            })
          } else {
            this.profileService.getOtherUserProfileInfo(user.username, username, 10).subscribe(userData =>{
              if(userData.relation == null){
                this.profileType = ProfileType.non_friend;
              } else if(userData.relation == "friend"){
                this.profileType = ProfileType.friend;
              } else if(userData.relation == "sent_req"){
                this.profileType = ProfileType.sent_req;
              } else {
                this.profileType = ProfileType.rec_req;
              }
              this.person = userData.person;
            });
          }
        });
      },
    });
  }


  ngOnDestroy(): void {
      this.loggedUserSub.unsubscribe();
  }
}
