import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { PersonBasic } from '../models/person_models/person-basic.model';
import { PostHomePageModel } from '../models/post_models/post-homepage.model';
import { ExploreService } from '../services/explore/explore.service';

@Component({
  selector: 'app-explore-page',
  templateUrl: './explore-page.component.html',
  styleUrls: ['./explore-page.component.css'],
})
export class ExplorePageComponent implements OnInit, OnDestroy {
  recommendedPosts: Array<PostHomePageModel> = new Array<PostHomePageModel>();

  newFriends: Array<PersonBasic> = new Array<PersonBasic>();

  constructor(public exploreService: ExploreService) {}
  ngOnDestroy(): void {
    this.exploreService.searchToggle = false;
  }

  ngOnInit(): void {}

  @HostListener('document:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    if (event.key == 'Escape') this.exploreService.searchToggle = false;
  }
}
