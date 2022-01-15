import { Component, Input, OnInit } from '@angular/core';
import { NOTIFICATION_TRIGGERS, Notification } from 'src/app/models/notification-models/notification.model';
import { PersonBasic } from 'src/app/models/person_models/person-basic.model';
import { AuthService } from 'src/app/services/authentication/auth.service';
import { FriendsService } from 'src/app/services/friends.service';
import { SocketService } from 'src/app/services/socket/socket.service';

@Component({
  selector: 'app-friend-item',
  templateUrl: './friend-item.component.html',
  styleUrls: ['./friend-item.component.css']
})
export class FriendItemComponent implements OnInit {

  @Input()
  friend: {person: PersonBasic, status: string};

  constructor(private authService: AuthService, private friendService: FriendsService, private socketService: SocketService) { }

  ngOnInit(): void {
  }


  onAddFriend() {
    this.authService.user.subscribe(user => {
      this.friendService.sendRequest(user.username, this.friend.person.username)
      .subscribe({
        next: (resp) => {
          this.socketService.createNotification(
            new Notification(
              0,
              this.friend.person.username,
              user.username,
              NOTIFICATION_TRIGGERS.SEND_FRIEND_REQUEST,
              'test'
            ));
            this.friend.status = "sent_req";
        },
        error: (err) => {
          console.log(err);
        }});
   }).unsubscribe();
  }


  onDeleteFriend() {

    this.authService.user.subscribe(user =>{
      this.friendService.deleteFriend(user.id, this.friend.person.id).subscribe({
        next: (resp) => {
          this.friend.status = "non_friend";
        },
        error: (err) => {
          console.log(err);
        },
      });
    }).unsubscribe();

  }


  onRejectRequest() {

    this.authService.user.subscribe(user => {
      this.friendService
      .deleteRequest(this.friend.person.username, user.username)
      .subscribe({
        next: (resp) => {
          this.friend.status = "non_friend"
        },
        error: (err) => {
          console.log(err);
        },
      });
    }).unsubscribe();
  }



  onDeleteRequest() {
    this.authService.user.subscribe(user => {
      this.friendService
      .deleteRequest(user.username, this.friend.person.username)
      .subscribe({
        next: (resp) => {
          this.friend.status = 'non_friend';
        },
        error: (err) => {
          console.log(err);
        },
      });
    }).unsubscribe();
  }


  onAcceptRequest() {
    this.authService.user.subscribe(user => {
      this.friendService.acceptRequest(this.friend.person.id, user.id).subscribe({
        next: (resp) => {
          this.friend.status = 'friend';
          this.socketService.createNotification(
            new Notification(
              0,
              this.friend.person.username,
              user.username,
              NOTIFICATION_TRIGGERS.ACCEPT_FRIEND_REQUEST,
              'test2'
            )
          );
        },
        error: (err) => {
          console.log(err);
        },
      });
    }).unsubscribe();
  }

}
