import { Component, OnInit } from '@angular/core';
import { LocationBasic } from '../models/location_models/location-basic.model';

@Component({
  selector: 'app-hotspots',
  templateUrl: './hotspots.component.html',
  styleUrls: ['./hotspots.component.css']
})
export class HotspotsComponent implements OnInit {

  locations: LocationBasic[] = [];

  constructor() { }

  ngOnInit(): void {
    this.locations.push(new LocationBasic("l1", "Pefkohori"));
    this.locations.push(new LocationBasic("l2", "Palilula"));
    this.locations.push(new LocationBasic("l3", "Kusadasi"));
  }

}
