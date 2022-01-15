import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { LocationBasic } from 'src/app/models/location_models/location-basic.model';
import { PersonBasic } from 'src/app/models/person_models/person-basic.model';
import { SearchService } from './search.service';

@Injectable({
  providedIn: 'root',
})
export class ExploreSearchService extends SearchService {
  private incoming: BehaviorSubject<{
    users: { person: PersonBasic; status: string }[];
    locations: { loc: LocationBasic; followed: boolean; postNo: number }[];
  }> = new BehaviorSubject(null);

  private startIndex: { users: number; loacations: number };
  private countNumber: { users: number; loacations: number };

  protected hasMore: BehaviorSubject<{ users: boolean; locations: boolean }> =
    new BehaviorSubject(null);

  initialLoad(pattern: string, count: number): void {
    this.pattern = pattern;
    this.startIndex = { users: 0, loacations: 0 };
    this.countNumber = { users: count, loacations: count };
    this.loadMore();
  }

  getIncoming(): Observable<{
    users: { person: PersonBasic; status: string }[];
    locations: { loc: LocationBasic; followed: boolean; postNo: number }[];
  }> {
    return this.incoming.asObservable();
  }

  getHasMore(): Observable<{ users: boolean; locations: boolean }> {
    return this.hasMore.asObservable();
  }

  loadMore() {
    this.http
      .get(
        `http://localhost:3000/explore/search/${this.pattern}/${this.loggedUser.id}/${this.startIndex.users}/${this.countNumber.users}/${this.startIndex.loacations}/${this.countNumber.loacations}`
      )
      .subscribe({
        next: (data: {
          users: { person: PersonBasic; status: string }[];
          locations: {
            loc: LocationBasic;
            followed: boolean;
            postNo: number;
          }[];
        }) => {
          this.incoming.next(data);
          this.hasMore.next({
            users: data.users.length == this.countNumber.users,
            locations: data.locations.length == this.countNumber.loacations,
          });
          this.startIndex.users += data.users.length;
          this.startIndex.loacations += data.locations.length;
        },
        error: (er) => console.log(er),
      });
  }
}
