import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { PersonBasic } from 'src/app/models/person_models/person-basic.model';
import { SearchService } from './search.service';

@Injectable({
  providedIn: 'root',
})
export class UserSearchService extends SearchService {
  private incoming: BehaviorSubject<
    Array<{ person: PersonBasic; status: string }>
  > = new BehaviorSubject<Array<{ person: PersonBasic; status: string }>>(null);

  getIncoming(): Observable<Array<{ person: PersonBasic; status: string }>> {
    return this.incoming.asObservable();
  }

  loadMore() {
    this.http
      .get(
        `http://localhost:3000/search/explore/users/${this.loggedUser.id}/${this.pattern}/${this.start}/${this.count}`
      )
      .pipe(
        map((data: Array<{ person: PersonBasic; status: any }>) =>
          data.map((x) => ({
            person: x.person,
            status:
              x.person.id == this.loggedUser.id
                ? 'personal'
                : x.status.friends
                ? 'friend'
                : x.status.requested
                ? 'rec_req'
                : x.status.pending
                ? 'sent_req'
                : 'non_friend',
          }))
        )
      )
      .subscribe({
        next: (data) => {
          console.log(this.pattern, data);
          this.incoming.next(data);
          this.hasMore.next(data.length == this.count);
          this.start += data.length;
        },
        error: (er) => console.log(er),
      });
  }
}
