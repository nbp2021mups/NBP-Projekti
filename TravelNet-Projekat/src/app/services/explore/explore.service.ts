import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LocationBasic } from 'src/app/models/location_models/location-basic.model';
import { PersonBasic } from 'src/app/models/person_models/person-basic.model';
import { ExploreSearchService } from '../search/explore-search.service';

@Injectable({
  providedIn: 'root',
})
export class ExploreService {
  public displayedUsers: Array<{ person: PersonBasic; status: string }> =
    new Array<{ person: PersonBasic; status: string }>();
  private userPool: Array<{ person: PersonBasic; status: string }> = new Array<{
    person: PersonBasic;
    status: string;
  }>();

  public displayedLocations: Array<{
    loc: LocationBasic;
    followed: boolean;
    postNo: number;
  }> = new Array<{ loc: LocationBasic; followed: boolean; postNo: number }>();
  private locationPool: Array<{
    loc: LocationBasic;
    followed: boolean;
    postNo: number;
  }> = new Array<{ loc: LocationBasic; followed: boolean; postNo: number }>();

  private pulledData: Map<number, Object> = new Map<number, Object>();

  public searchFilter: string = '';
  public searchToggle: boolean = false;

  public hasMoreUsers: boolean = false;
  public hasMoreLocations: boolean = false;

  private loggedUser: { id: number; username: string };

  constructor(
    private http: HttpClient,
    private exploreSearchService: ExploreSearchService
  ) {}

  ngOnInit(): void {
    this.loggedUser = JSON.parse(localStorage.getItem('logged-user'));
  }

  search(event: KeyboardEvent) {
    if (this.searchFilter == '') {
      this.displayedLocations = this.locationPool;
      this.displayedUsers = this.userPool;
    } else {
      const filter = this.searchFilter.toLowerCase();
      if (event.key == 'Enter') {
        this.exploreSearchService.getIncoming().subscribe({
          next: (res) => {
            res.users.forEach((u) => {
              if (!this.pulledData[u.person.id]) {
                this.pulledData[u.person.id] = u;
                this.userPool.push(u);
              }
            });
            res.locations.forEach((l) => {
              if (!this.pulledData[l.loc.id]) {
                this.pulledData[l.loc.id] = l;
                this.locationPool.push(l);
              }
            });
            this.filterUsers(filter);
            this.filterLocations(filter);
          },
          error: (er) => console.log(er),
        });
        this.exploreSearchService.getHasMore().subscribe({
          next: (hasMore) => {
            this.hasMoreUsers = hasMore.users;
            this.hasMoreLocations = hasMore.locations;
          },
          error: (er) => console.log(er),
        });
        this.exploreSearchService.initialLoad(filter, 10);
      } else {
        this.filterUsers(filter);
        this.filterLocations(filter);
      }
    }
  }
  filterLocations(filter: string) {
    this.displayedLocations = this.locationPool.filter(
      (lP) =>
        lP.loc.city.toLowerCase().match(filter) ||
        lP.loc.country.toLowerCase().match(filter)
    );
  }
  filterUsers(filter: string) {
    this.displayedUsers = this.userPool.filter(
      (uP) =>
        uP.person.username.toLowerCase().match(filter) ||
        uP.person.firstName.toLowerCase().match(filter) ||
        uP.person.lastName.toLowerCase().match(filter)
    );
  }

  loadMore() {
    this.exploreSearchService.loadMore();
  }
}
