import { Component, OnInit } from '@angular/core';
import { PostHomePageModel } from '../models/post_models/post-homepage.model';
import { AuthService } from '../services/authentication/auth.service';
import { HomepageService } from '../services/homepage.service';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {

  posts: PostHomePageModel[] = [];
  pageSize: number = 5;

  constructor(private authService: AuthService, private homeService: HomepageService) { }

  ngOnInit(): void {
    this.authService.user.subscribe(user => {
      this.homeService.getHomePagePosts(user.username, 0, this.pageSize).subscribe({
        next: posts => {
          this.posts = posts;
          console.log(this.posts);
        },
        error: err => {
          console.log(err);
        }
      })
    }).unsubscribe();
  }

}
