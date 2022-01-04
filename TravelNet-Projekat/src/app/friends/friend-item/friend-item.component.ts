import { Component, Input, OnInit } from '@angular/core';
import { PersonBasic } from 'src/app/models/person_models/person-basic.model';

@Component({
  selector: 'app-friend-item',
  templateUrl: './friend-item.component.html',
  styleUrls: ['./friend-item.component.css']
})
export class FriendItemComponent implements OnInit {

  @Input()
  friend: PersonBasic;

  constructor() { }

  ngOnInit(): void {
  }


  isFriend(): boolean{
    //ovo simulira ulogovane korisnike i njegove pratioce
    const friends: PersonBasic[] = [];
    friends.push(new PersonBasic("p1", "Djoka", "Djokic", "123", [], []));

    if(friends.find(friend => friend.id == this.friend.id))
      return true;
    else
      return false;

  }
}
