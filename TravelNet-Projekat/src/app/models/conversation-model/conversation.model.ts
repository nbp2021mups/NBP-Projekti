import axios from 'axios';
import { Message } from '../message-model/message.model';

export class Conversation {
  public id: number;
  public messages: Array<Message>;
  public topMessage: Message;
  public myUnread: number;
  public friend: string;
  public friendImage: string;

  public constructor(id: number, friend: string, friendImage: string) {
    this.id = id;
    this.friend = friend;
    this.friendImage = friendImage;
    this.messages = new Array<Message>();
    this.topMessage = null;
    this.myUnread = 0;
    this.onInit();
  }

  async onInit() {
    axios.get(`http://localhost:3000/messages/${this.id}/0/20`).then((res) => {
      res.data.forEach((m) => {
        this.messages = [m, ...this.messages];
        this.topMessage = m;
        if (m.from == this.friend && m.timeRead == null) this.myUnread += 1;
      });
    });
  }
}
