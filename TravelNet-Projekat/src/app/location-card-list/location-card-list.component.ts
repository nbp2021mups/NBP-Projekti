import { Component, OnInit } from '@angular/core';
import { LocationFull } from '../models/location_models/location-full.model';

@Component({
  selector: 'app-location-card-list',
  templateUrl: './location-card-list.component.html',
  styleUrls: ['./location-card-list.component.css']
})
export class LocationCardListComponent implements OnInit {
  location1:LocationFull ={
    id: 10,
    followersNo: 430,
    postsNo: 0,
    followed: false,
    posts: [],
    addPost: null,
    country: 'Serbia',
    city: 'Leskovac'
  }
  location2:LocationFull ={
    id: 20,
    followersNo: 320,
    postsNo: 0,
    followed: false,
    posts: [],
    addPost: null,
    country: 'Bulgaria',
    city: 'Sofia'
  }
  location3:LocationFull ={
    id: 30,
    followersNo: 210,
    postsNo: 0,
    followed: false,
    posts: [],
    addPost: null,
    country: 'Macedonia',
    city: 'Skopje'
  }
  public locations: Array<LocationFull> = new Array<LocationFull>();
  constructor() { 
    this.locations.push(this.location1);
    this.locations.push(this.location2);
    this.locations.push(this.location3);
  }

  ngOnInit(): void {
  }

}
