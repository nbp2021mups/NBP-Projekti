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
    let path = "https://image.shutterstock.com/image-photo/young-girl-headphones-short-hair-600w-1951015864.jpg";
    this.person = new PersonFull("pid1", "Srdjan", "Petrovic", path, [], [], "srdj4n@gmail.com");
  }

  isFriend(): boolean{
    return true;
  }
}
