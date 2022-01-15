import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LocationBasic } from 'src/app/models/location_models/location-basic.model';
import { PersonBasic } from 'src/app/models/person_models/person-basic.model';
import { LocationSearchService } from '../search/location-search.service';
import { UserSearchService } from '../search/user-search.service';

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
  public searchType: string = 'Korisnici';

  public hasMore: { users: boolean; locations: boolean } = {
    users: false,
    locations: false,
  };
  public noResult: { users: boolean; locations: boolean } = {
    users: false,
    locations: false,
  };

  constructor(
    private http: HttpClient,
    private userSearchService: UserSearchService,
    private locationSerachService: LocationSearchService
  ) {}

  public search(event: KeyboardEvent) {
    if (event.key == 'Enter') this.searchToggle = true;
    if (this.searchFilter == '') {
      this.displayedLocations = this.locationPool;
      this.displayedUsers = this.userPool;
    } else {
      switch (this.searchType) {
        case 'Korisnici':
          this.searchUsers(this.searchFilter.toLowerCase(), event.key);
          break;
        case 'Lokacije':
          this.searchLocations(this.searchFilter.toLowerCase(), event.key);
          break;
      }
    }
  }

  searchLocations(filter: string, key: string) {
    if (key == 'Enter') {
      this.locationSerachService.getIncoming().subscribe({
        next: (res) => {
          if (res) {
            const locationpool = this.locationPool.length;
            res.forEach((u) => {
              if (!this.pulledData[u.loc.id]) {
                this.pulledData[u.loc.id] = u;
                this.locationPool.push(u);
              }
            });
            this.filterLocations(filter);
            this.hasMore.locations =
              this.locationPool.length - locationpool == 10;
            this.noResult.locations = this.displayedLocations.length == 0;
          }
        },
        error: (er) => console.log(er),
      });
      this.locationSerachService.initialLoad(filter, 10);
    } else {
      this.filterLocations(filter);
    }
  }

  searchUsers(filter: string, key: string) {
    if (key == 'Enter') {
      this.userSearchService.getIncoming().subscribe({
        next: (res) => {
          if (res) {
            const userpool = this.userPool.length;
            res.forEach((u) => {
              if (!this.pulledData[u.person.id]) {
                this.pulledData[u.person.id] = u;
                this.userPool.push(u);
              }
            });
            this.filterUsers(filter);
            this.hasMore.users = this.userPool.length - userpool == 10;
            this.noResult.users = this.displayedUsers.length == 0;
          }
        },
        error: (er) => console.log(er),
      });
      this.userSearchService.initialLoad(filter, 10);
    } else {
      this.filterUsers(filter);
    }
  }

  filterLocations(filter: string) {
    this.displayedLocations = this.locationPool.filter(
      (lP) =>
        lP.loc.city.toLowerCase().match(filter) ||
        lP.loc.country.toLowerCase().match(filter)
    );
    if (this.displayedLocations.length > 0) this.noResult.locations = false;
  }
  filterUsers(filter: string) {
    this.displayedUsers = this.userPool.filter(
      (uP) =>
        uP.person.username.toLowerCase().match(filter) ||
        uP.person.firstName.toLowerCase().match(filter) ||
        uP.person.lastName.toLowerCase().match(filter)
    );
    if (this.displayedUsers.length > 0) this.noResult.users = false;
  }

  loadMoreUsers() {
    this.userSearchService.loadMore();
  }
  loadMoreLocations() {
    this.locationSerachService.loadMore();
  }
}
