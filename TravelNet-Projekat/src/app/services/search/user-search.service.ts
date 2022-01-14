import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import {
  PersonExplore,
  ProfileType,
} from 'src/app/models/person_models/person-explore.model';
import { SearchService } from './search.service';

@Injectable({
  providedIn: 'root',
})
export class UserSearchService extends SearchService {
  private incoming: BehaviorSubject<Array<PersonExplore>>;

  getIncoming(): Observable<Array<PersonExplore>> {
    return this.incoming.asObservable();
  }

  loadMore() {
    this.http
      .get(
        `http://localhost:3000/search/users/${this.pattern}/${this.loggedUser.id}/${this.start}/${this.count}`
      )
      .pipe(
        map((data: Array<any>) =>
          data.map(
            (x) =>
              new PersonExplore(
                x.id,
                x.firstName,
                x.lastName,
                x.image,
                x.username,
                x.friendsNo,
                x.postsNo,
                x.followedLocationsNo,
                x.id == this.loggedUser.id
                  ? ProfileType.personal
                  : x.status.friends
                  ? ProfileType.friend
                  : x.status.requested
                  ? ProfileType.rec_req
                  : x.status.pending
                  ? ProfileType.sent_req
                  : ProfileType.non_friend
              )
          )
        )
      )
      .subscribe({
        next: (data) => {
          this.incoming.next(data);
          this.hasMore.next(data.length == this.count);
          this.start += data.length;
        },
        error: (er) => console.log(er),
      });
  }
}
