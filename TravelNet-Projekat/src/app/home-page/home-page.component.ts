import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { LocationBasic } from '../models/location_models/location-basic.model';
import { PostHomePageModel } from '../models/post_models/post-homepage.model';
import { AuthService } from '../services/authentication/auth.service';
import { HomepageService } from '../services/homepage.service';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css'],
})
export class HomePageComponent implements OnInit {
  posts: PostHomePageModel[] = [];
  leaderboard: {loc: LocationBasic, postsNo: number}[] = [];
  pageSize: number = 100;
  isLoading: boolean = false;
  hasMore: boolean = true;

  constructor(
    private authService: AuthService,
    private homeService: HomepageService
  ) {}

  ngOnInit(): void {

    this.authService.user.subscribe(user => {
      this.isLoading = true;
      forkJoin([this.homeService.getHomePagePosts(user.username, 0, this.pageSize), this.homeService.getLeaderboard()])
      .subscribe(result => {
        this.posts = result[0];
        result[1].forEach(loc => {
          this.leaderboard.push({loc: loc.loc, postsNo: loc.postsNo});
        });
        this.isLoading = false;
      })
    }).unsubscribe();

  }


  loadMore(event) {
    this.authService.user.subscribe(user => {
      this.homeService.getHomePagePosts(user.username, this.posts.length, this.pageSize).subscribe(resp => {
        this.posts = this.posts.concat(resp);
        if(resp.length < this.pageSize){
          this.hasMore = false;
        }
      });
    }).unsubscribe();

  }
}
