import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { LocationFull } from '../models/location_models/location-full.model';

@Component({
  selector: 'app-location-page',
  templateUrl: './location-page.component.html',
  styleUrls: ['./location-page.component.css']
})
export class LocationPageComponent implements OnInit {

  location: LocationFull;
  paramsSub: Subscription

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.paramsSub = this.route.params.subscribe(
      {
        next: params => {
          console.log(params['locationId']);
        },
        error: err => {console.log(err);}
      }
    );
  }

}
