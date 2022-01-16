import { Component, Input, OnInit } from '@angular/core';
import { PersonBasic } from '../models/person_models/person-basic.model';

@Component({
  selector: 'app-friend-recommendation-item',
  templateUrl: './friend-recommendation-item.component.html',
  styleUrls: ['./friend-recommendation-item.component.css']
})
export class FriendRecommendationItemComponent implements OnInit {

  @Input()
  friend: {person: PersonBasic, commonNum: number};

  constructor() { }

  ngOnInit(): void {
    console.log(this.friend);
  }


  onAddFriend() {

  }
}
