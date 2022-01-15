import { Component, OnInit, Input } from '@angular/core';
import { LocationBasic } from '../models/location_models/location-basic.model';

@Component({
  selector: 'app-hotspots',
  templateUrl: './hotspots.component.html',
  styleUrls: ['./hotspots.component.css']
})
export class HotspotsComponent implements OnInit {

  @Input()
  locations: {loc: LocationBasic, postsNo: number}[] = [];

  constructor() { }

  ngOnInit(): void {
  }

}
