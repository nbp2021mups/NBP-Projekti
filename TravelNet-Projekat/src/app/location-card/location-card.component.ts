import { Component, OnInit, Input } from '@angular/core';
import { Integer } from 'neo4j-driver';

@Component({
  selector: 'app-location-card',
  templateUrl: './location-card.component.html',
  styleUrls: ['./location-card.component.css']
})
export class LocationCardComponent implements OnInit {

  constructor() { }
  @Input() cardLocation:{city:String,country:String,postsNo:Integer}
  ngOnInit(): void {
  }

}
