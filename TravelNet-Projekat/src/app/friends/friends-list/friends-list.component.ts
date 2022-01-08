import { Component, OnInit } from '@angular/core';
import { PersonBasic } from 'src/app/models/person_models/person-basic.model';

@Component({
  selector: 'app-friends-list',
  templateUrl: './friends-list.component.html',
  styleUrls: ['./friends-list.component.css']
})
export class FriendsListComponent implements OnInit {

  friends: PersonBasic[] = [];

  constructor() { }

  ngOnInit(): void {
    
  }

}
