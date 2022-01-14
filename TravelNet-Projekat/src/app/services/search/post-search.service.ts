import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { LocationBasic } from 'src/app/models/location_models/location-basic.model';
import { PersonBasic } from 'src/app/models/person_models/person-basic.model';
import { PostHomePageModel } from 'src/app/models/post_models/post-homepage.model';
import { SearchService } from './search.service';

@Injectable({
  providedIn: 'root',
})
export class PostSearchService extends SearchService {
  private incoming: BehaviorSubject<Array<PostHomePageModel>> =
    new BehaviorSubject([]);

  getIncoming(): Observable<Array<PostHomePageModel>> {
    return this.incoming.asObservable();
  }

  loadMore() {
    this.http
      .get(
        `http://localhost:3000/search/posts/${this.pattern}/${this.loggedUser.id}/${this.start}/${this.count}`
      )
      .pipe(
        map((data: Array<any>) =>
          data.map(
            (x) =>
              new PostHomePageModel(
                x.id,
                new PersonBasic(
                  x.userId,
                  x.userFirstName,
                  x.userLastName,
                  x.userImage,
                  x.userUsername
                ),
                new LocationBasic(
                  x.locationId,
                  x.locationCountry,
                  x.locationCity
                ),
                x.image,
                x.description,
                x.likesNo,
                x.commentsNo,
                x.liked
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
