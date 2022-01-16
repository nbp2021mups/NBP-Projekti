import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { PersonBasic } from '../models/person_models/person-basic.model';
import { AuthService } from '../services/authentication/auth.service';
import { FriendsService } from '../services/friends.service';

@Component({
  selector: 'app-friend-recommendation-item',
  templateUrl: './friend-recommendation-item.component.html',
  styleUrls: ['./friend-recommendation-item.component.css']
})
export class FriendRecommendationItemComponent implements OnInit {

  @Input()
  friend: {person: PersonBasic, commonNum: number};

  @Output()
  friendAdded: EventEmitter<number> = new EventEmitter<number>();

  addSucc: string = null;

  constructor(private authService: AuthService, private friendService: FriendsService) { }

  ngOnInit(): void {
  }


  onAddFriend() {
    this.authService.user.subscribe(user => {
      this.friendService.sendRequest(user.username, this.friend.person.username).subscribe({
        next: resp => {
          this.addSucc = "Prijatelj uspesno dodat."
          setTimeout(() => {
            this.friendAdded.emit(this.friend.person.id);
            this.addSucc = null
          }, 2000);
        },
        error: err => {
          console.log(err);
        }
      });
    }).unsubscribe();
  }
}
