import { Component, OnInit } from '@angular/core';
import { Conversation } from '../models/conversation-model/conversation.model';
import { Message } from '../models/message-model/message.model';
import { User } from '../models/user.model';

export const DAYS = {
  1: 'Pon',
  2: 'Uto',
  3: 'Sre',
  4: 'Čet',
  5: 'Pet',
  6: 'Sub',
  7: 'Ned',
};

export const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit {
  public conversations: Conversation[] = [];
  public openConversation: Conversation = null;
  public loggedUser: User = null;
  public newMessage: String;
  constructor() {}

  ngOnInit(): void {
    this.loggedUser = new User(102, 'sssteeefaaan', 'sds', new Date());
    this.conversations.push(new Conversation(123, 'Stefan', 'Petar'));
    this.openConversation = this.conversations[0];
  }

  getDay(date: Date): string {
    const currentDate = new Date();
    const diff = currentDate.getTime() - date.getTime();
    if (diff < MILLISECONDS_PER_DAY) {
      if (currentDate.getHours() >= date.getHours())
        return `${date.getHours()}:${
          date.getMinutes() < 10 ? '0' : ''
        }${date.getMinutes()}h`;
      else return 'Juče';
    } else if (
      diff < 2 * MILLISECONDS_PER_DAY &&
      currentDate.getHours() >= date.getHours()
    )
      return 'Juče';

    return DAYS[date.getDay()];
  }

  async joinChat() {
    try {
    } catch (err) {
      console.log(err);
      return;
    }
  }

  async sendMessage() {
    if (this.newMessage.trim() === '') {
      return;
    }

    try {
    } catch (err) {
      console.log(err);
    }
  }
}
