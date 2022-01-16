import { Component, OnInit, Input } from '@angular/core';
import { PersonBasic } from '../models/person_models/person-basic.model';

@Component({
  selector: 'app-friend-recommendation-list',
  templateUrl: './friend-recommendation-list.component.html',
  styleUrls: ['./friend-recommendation-list.component.css']
})
export class FriendRecommendationListComponent implements OnInit {

  constructor() { }

  @Input()
  friends: { person: PersonBasic, commonNum: number}[] = [];

  ngOnInit(): void {

  }

}
