import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { LocationBasic } from 'src/app/models/location_models/location-basic.model';
import { SearchService } from './search.service';

@Injectable({
  providedIn: 'root',
})
export class LocationSearchService extends SearchService {
  private incoming: BehaviorSubject<
    Array<{ loc: LocationBasic; followed: boolean; postNo: number }>
  > = new BehaviorSubject(null);

  getIncoming(): Observable<
    Array<{ loc: LocationBasic; followed: boolean; postNo: number }>
  > {
    return this.incoming.asObservable();
  }

  loadMore() {
    this.http
      .get(
        `http://localhost:3000/search/explore/locations/${this.loggedUser.id}/${this.pattern}/${this.start}/${this.count}`
      )
      .subscribe({
        next: (data: any) => {
          console.log(this.pattern, data);
          this.incoming.next(data);
          this.hasMore.next(data.length == this.count);
          this.start += data.length;
        },
        error: (er) => console.log(er),
      });
  }
}
