import { Component, OnInit } from '@angular/core';
import { PersonFull } from '../models/person_models/person-full.model';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.css']
})
export class ProfilePageComponent implements OnInit {

  person: PersonFull;

  constructor() { }

  ngOnInit(): void {
  }

  isFriend(): boolean{
    return true;
  }
}
