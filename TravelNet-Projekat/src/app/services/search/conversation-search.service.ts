import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { Conversation } from 'src/app/models/conversation-model/conversation.model';
import { SearchService } from './search.service';
import { Message } from './../../models/message-model/message.model';

@Injectable({
  providedIn: 'root',
})
export class ConversationSearchService extends SearchService {
  private incoming: BehaviorSubject<Array<Conversation>> = new BehaviorSubject(
    []
  );

  getIncoming(): Observable<Array<Conversation>> {
    return this.incoming.asObservable();
  }

  loadMore() {
    this.http
      .get(
        `http://localhost:3000/search/conversations/${this.pattern}/${this.loggedUser.id}/${this.start}/${this.count}`
      )
      .pipe(
        map((data: Array<any>) =>
          data.map(
            (x) =>
              new Conversation(
                x.id,
                x.friendUsername,
                x.friendImage,
                new Message(
                  0,
                  x.topMessageFrom,
                  x.topMessageTo,
                  x.id,
                  x.topMessageContent,
                  x.topMessageTimeSent,
                  x.unreadCount == 0
                ),
                x.topMessageFrom != this.loggedUser.username ? x.unreadCount : 0
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
