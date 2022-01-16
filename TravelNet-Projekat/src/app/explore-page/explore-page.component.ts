import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { PersonBasic } from '../models/person_models/person-basic.model';
import { PostHomePageModel } from '../models/post_models/post-homepage.model';
import { AuthService } from '../services/authentication/auth.service';
import { ExploreService } from '../services/explore/explore.service';
import { FriendsService } from '../services/friends.service';

@Component({
  selector: 'app-explore-page',
  templateUrl: './explore-page.component.html',
  styleUrls: ['./explore-page.component.css'],
})
export class ExplorePageComponent implements OnInit, OnDestroy {
  recommendedPosts: Array<PostHomePageModel> = new Array<PostHomePageModel>();

  newFriends: {person: PersonBasic, commonNum: number}[] = [];

  constructor(public exploreService: ExploreService, private authService: AuthService, private friendService: FriendsService) {}
  ngOnDestroy(): void {
    this.exploreService.searchToggle = false;
  }

  ngOnInit(): void {
    this.authService.user.subscribe(user => {
      this.friendService.getRecommendations(user.id).subscribe(
        {
          next: resp => {
            resp.forEach(friend => {
              this.newFriends.push({person: friend.person, commonNum: friend.commonNum});
            });
            //
          },
          error: err => {console.log(err);}
        });
    }).unsubscribe();
  }

 /*  @HostListener('document:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    if (event.key == 'Escape') this.exploreService.searchToggle = false;
  } */
}
