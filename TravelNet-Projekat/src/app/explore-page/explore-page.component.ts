import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { PersonBasic } from '../models/person_models/person-basic.model';
import { PostHomePageModel } from '../models/post_models/post-homepage.model';
import { PostSearchService } from '../services/search/post-search.service';

@Component({
  selector: 'app-explore-page',
  templateUrl: './explore-page.component.html',
  styleUrls: ['./explore-page.component.css'],
})
export class ExplorePageComponent implements OnInit {
  recommendedPosts: Array<PostHomePageModel> = new Array<PostHomePageModel>();

  newFriends: Array<PersonBasic> = new Array<PersonBasic>();

  constructor() {}

  ngOnInit(): void {}
}
