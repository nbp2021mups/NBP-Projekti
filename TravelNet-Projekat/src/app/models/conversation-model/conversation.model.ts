import { HttpClient } from '@angular/common/http';
import axios from 'axios';
import { Message } from '../message-model/message.model';

export class Conversation {
  public id: number;
  public messages: Array<Message>;
  public topMessage: Message;
  public myUnread: number;
  public friend: string;
  public friendImage: string;
  public loaded: boolean;
  public hasMore: boolean = false;

  public constructor(
    id: number,
    friend: string,
    friendImage: string,
    topMessage: Message,
    myUnread: number
  ) {
    this.id = id;
    this.friend = friend;
    this.friendImage = friendImage;
    this.messages = new Array<Message>();
    this.topMessage = topMessage;
    this.myUnread = myUnread;
    this.loaded = false;
  }

  public loadMore() {
    this.loadMessages(this.messages.length, 20);
  }

  public async loadMessages(start: number = 0, count: number = 20) {
    this.loaded = true;
    axios
      .get(`http://localhost:3000/messages/${this.id}/${start}/${count}`)
      .then((res) => {
        this.hasMore = count == res.data.length;
        res.data.forEach((m) => {
          m.chatId = this.id;
          this.messages.push(m);
        });
        this.topMessage =
          this.messages.length > 0 ? this.messages[0] : this.topMessage;
      });
  }
}
