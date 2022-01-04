import { Component, OnInit } from '@angular/core';
import { PersonBasic } from '../models/person_models/person-basic.model';
import { PostModel } from '../models/post_models/post.model';

@Component({
  selector: 'app-explore-page',
  templateUrl: './explore-page.component.html',
  styleUrls: ['./explore-page.component.css']
})
export class ExplorePageComponent implements OnInit {

  posts: PostModel[] = [];
  newFriends: PersonBasic[] = [];

  constructor() { }

  ngOnInit(): void {
  }

}
