import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs';
import { Notification, NOTIFICATION_TRIGGERS } from '../models/notification-models/notification.model';
import { PersonFull } from '../models/person_models/person-full.model';
import { AuthService } from '../services/authentication/auth.service';
import { FriendsService } from '../services/friends.service';
import { PostsService } from '../services/posts.service';
import { ProfileService } from '../services/profile.service';
import { SocketService } from '../services/socket/socket.service';

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
  loggedID: number;
  loggedUsername: string;
  profileType: ProfileType;
  allRead: boolean = false;
  pageSize: number = 3;

  constructor(private authService: AuthService, private route: ActivatedRoute, 
    private profileService: ProfileService, private friendService: FriendsService, 
    private socketService: SocketService, private postService: PostsService) { }

  ngOnInit(): void {
    this.route.params.subscribe({
      next: (params: Params) => {
        const username = params['username'];
        this.loggedUserSub = this.authService.user.subscribe(user => {
          if(!user){ return;}
          this.loggedID = user.id;
          this.loggedUsername = user.username;
          if(username == this.loggedUsername) {
            this.profileType = ProfileType.personal;
            this.profileService.getLoggedUserProfileInfo(this.loggedUsername, this.pageSize).subscribe(user => {
              this.person = user;
            })
          } else {
            this.profileService.getOtherUserProfileInfo(user.username, username, this.pageSize).subscribe(userData =>{
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
      }
    });
  }

  onAddFriend() {
    this.friendService.sendRequest(this.loggedUsername, this.person.username).subscribe({
      next: resp => {
        alert(resp);
        this.profileType = ProfileType.sent_req;
        this.socketService.createNotification(new Notification(0, this.person.username, this.loggedUsername, 
          NOTIFICATION_TRIGGERS.SEND_FRIEND_REQUEST, "test"));
      },
      error: err => {console.log(err);}
    });
  }

  onDeleteFriend() {
    this.friendService.deleteFriend(this.loggedID, this.person.id).subscribe({
      next: resp => {
        alert(resp);
        this.profileType = ProfileType.non_friend;
        this.person.posts = null;
      },
      error: err => {console.log(err);}
    });
  }

  onAcceptRequest() {
    this.friendService.acceptRequest(this.person.id, this.loggedID).subscribe({
      next: resp => {
        alert(resp);
        this.profileType = ProfileType.friend;
        this.socketService.createNotification(new Notification(0, this.person.username, this.loggedUsername, 
          NOTIFICATION_TRIGGERS.ACCEPT_FRIEND_REQUEST, "test2"));
      },
      error: err => {console.log(err);}
    });
  }

  onRejectRequest() {
    this.friendService.deleteRequest(this.person.username, this.loggedUsername).subscribe({
      next: resp => {
        alert(resp);
        this.profileType = ProfileType.non_friend;
      },
      error: err => {console.log(err);}
    });
  }

  onCancelRequest() {
    this.friendService.deleteRequest(this.loggedUsername, this.person.username).subscribe({
      next: resp => {
        alert(resp);
        this.profileType = ProfileType.non_friend;
      },
      error: err => {console.log(err);}
    });
  }


  loadMore(event) {
    this.authService.user.subscribe(user => {
      const loggedU = user.username;
      this.postService.loadMoreProfilePosts(this.person.username, loggedU, this.person.posts.length, this.pageSize).subscribe({
        next: resp => {
          if(resp.length == 0){
            this.allRead = true;
            return;
          }
          resp.forEach(post => {
            post.setPerson(this.person);
          });
          this.person.posts = this.person.posts.concat(resp);
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


  ngOnDestroy(): void {
      this.loggedUserSub.unsubscribe();
  }
}
