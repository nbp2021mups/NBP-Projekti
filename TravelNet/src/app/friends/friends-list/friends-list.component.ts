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
    let path = "https://image.shutterstock.com/image-photo/home-office-dress-code-girl-600w-1719984745.jpg";
    let p = new PersonBasic("p1", "Miljana", "Simic", path, [], []);
    for(let i = 0; i < 5; i++)
      this.friends.push(p);
  }

}
