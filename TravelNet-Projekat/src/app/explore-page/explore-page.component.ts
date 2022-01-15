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
  public displayedPosts: Array<PostHomePageModel> =
    new Array<PostHomePageModel>();
  pulledPosts: Array<PostHomePageModel> = new Array<PostHomePageModel>();
  private pulledPostIds: Map<number, PostHomePageModel> = new Map<
    number,
    PostHomePageModel
  >();

  public searchFilter: string = '';
  public hasMore: boolean = false;
  private loggedUser: { id: number; username: string };

  newFriends: Array<PersonBasic> = new Array<PersonBasic>();

  constructor(
    private http: HttpClient,
    private searchService: PostSearchService
  ) {}

  ngOnInit(): void {
    this.loggedUser = JSON.parse(localStorage.getItem('logged-user'));
    this.loadRecommended();
  }

  loadRecommended(start: number = 0, count: number = 10) {
    this.http
      .get(
        `http://localhost:3000/explore/${this.loggedUser.id}/${start}/${count}`
      )
      .subscribe({
        next: (res: Array<PostHomePageModel>) => {
          this.recommendedPosts = [...this.recommendedPosts, ...res];
          this.hasMore = res.length == count;
          this.displayedPosts = this.recommendedPosts;
        },
        error: (err) => console.log(err),
      });
  }

  loadMoreRecommended() {
    this.loadRecommended(this.recommendedPosts.length);
  }

  searchPosts(event: KeyboardEvent) {
    if (this.searchFilter == '') {
      this.displayedPosts = this.recommendedPosts;
      return;
    } else {
      const toLower = this.searchFilter.toLowerCase();
      if (event.key == 'Enter') {
        this.searchService.getIncoming().subscribe({
          next: (res) => {
            res.forEach((p) => {
              if (!this.pulledPostIds[p.id]) {
                this.pulledPostIds[p.id] = p;
                this.pulledPosts.push(p);
              }
            });
            this.displayedPosts = this.pulledPosts.filter(
              (p) =>
                p.person.username.toLowerCase().match(toLower) ||
                p.location.city.toLowerCase().match(toLower) ||
                p.location.country.toLowerCase().match(toLower) ||
                p.person.firstName.toLowerCase().match(toLower) ||
                p.person.lastName.toLowerCase().match(toLower)
            );
          },
          error: (er) => console.log(er),
        });
        this.searchService.getHasMore().subscribe({
          next: (hasMore) => {
            this.hasMore = hasMore;
          },
          error: (er) => console.log(er),
        });
        this.searchService.initialLoad(toLower, 10);
      } else {
        this.displayedPosts = this.pulledPosts.filter(
          (p) =>
            p.person.username.toLowerCase().match(toLower) ||
            p.location.city.toLowerCase().match(toLower) ||
            p.location.country.toLowerCase().match(toLower) ||
            p.person.firstName.toLowerCase().match(toLower) ||
            p.person.lastName.toLowerCase().match(toLower)
        );
      }
    }
  }

  loadMore() {
    if (this.displayedPosts == this.recommendedPosts)
      this.loadMoreRecommended();
    else this.loadMoreSearchResults();
  }

  loadMoreSearchResults() {
    this.searchService.loadMore();
  }
}
