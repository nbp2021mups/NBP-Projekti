import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { PersonBasic } from '../models/person_models/person-basic.model';
import { PostHomePageModel } from '../models/post_models/post-homepage.model';
import { AuthService } from '../services/authentication/auth.service';
import { ExploreService } from '../services/explore/explore.service';
import { FriendsService } from '../services/friends.service';
import { PostsService } from '../services/posts.service';

@Component({
  selector: 'app-explore-page',
  templateUrl: './explore-page.component.html',
  styleUrls: ['./explore-page.component.css'],
})
export class ExplorePageComponent implements OnInit, OnDestroy {
  recommendedPosts: PostHomePageModel[] = [];

  newFriends: {person: PersonBasic, commonNum: number}[] = [];

  pageSize: number = 5;
  isLoading: boolean = false;
  hasMore: boolean = true;

  constructor(public exploreService: ExploreService, private authService: AuthService, 
    private friendService: FriendsService, private postService: PostsService) {}
  ngOnDestroy(): void {
    this.exploreService.searchToggle = false;
  }

  ngOnInit(): void {
    this.authService.user.subscribe(user => {
      this.isLoading = true;
      this.friendService.getRecommendations(user.id).subscribe(
        {
          next: resp => {
            resp.forEach(friend => {
              this.newFriends.push({person: friend.person, commonNum: friend.commonNum});
            });
            this.postService.getExplorePosts(user.id, 0, this.pageSize).subscribe({
              next: resp => {
                this.recommendedPosts = resp;
                this.isLoading = false;
              },
              error: err => {console.log(err);}
            });
          },
          error: err => {console.log(err);}
        });
    }).unsubscribe();
  }



  loadMore(event) {
    this.authService.user.subscribe(user => {
      this.postService.getExplorePosts(user.id, this.recommendedPosts.length, this.pageSize).subscribe({
        next: resp => {
          this.recommendedPosts = this.recommendedPosts.concat(resp);
          if(resp.length < this.pageSize){
            this.hasMore = false;
          }
        },
        error: err => {
          console.log(err);
        }
      });
    }).unsubscribe();
  }

}
