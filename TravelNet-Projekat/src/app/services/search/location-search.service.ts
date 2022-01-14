import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { LocationFull } from 'src/app/models/location_models/location-full.model';
import { SearchService } from './search.service';

@Injectable({
  providedIn: 'root',
})
export class LocationSearchService extends SearchService {
  private incoming: BehaviorSubject<Array<LocationFull>> = new BehaviorSubject(
    []
  );

  getIncoming(): Observable<Array<LocationFull>> {
    return this.incoming.asObservable();
  }

  loadMore() {
    this.http
      .get(
        `http://localhost:3000/search/locations/${this.pattern}/${this.loggedUser.id}/${this.start}/${this.count}`
      )
      .subscribe({
        next: (data: Array<LocationFull>) => {
          this.incoming.next(data);
          this.hasMore.next(data.length == this.count);
          this.start += data.length;
        },
        error: (er) => console.log(er),
      });
  }
}
