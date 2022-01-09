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

export const ALLOWED_ALPHANUM = [
  'backspace',
  ...'qwertyuiopasdfghjklzxcvbn1234567890'.split(''),
].reduce((acc, el) => ({ ...acc, [el]: true }), {});

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit {
  public conversations: Conversation[] = Array<Conversation>();
  public filteredConversations: Conversation[] = Array<Conversation>();
  public selectedConversation: Conversation = null;
  public selectedIndex!: number;
  public filter: string = '';
  public loggedUser: User = null;
  public newMessage: string = '';
  constructor() {}

  ngOnInit(): void {
    this.loggedUser = new User(102, 'Stefan', 'proba', new Date());
    this.conversations.push(new Conversation(123, 'Frank', 'Stefan'));
    this.conversations.push(new Conversation(123, 'Nenad', 'Stefan'));
    this.conversations.push(new Conversation(123, 'Petko', 'Stefan'));
    this.conversations.push(new Conversation(123, 'Ranko', 'Stefan'));
    this.conversations.push(new Conversation(123, 'Dragoje', 'Stefan'));
    this.conversations.push(new Conversation(123, 'Stojan', 'Stefan'));
    this.selectedConversation = this.conversations[(this.selectedIndex = 0)];
    this.filteredConversations = this.conversations;
  }

  getDay(date: Date): string {
    const currentDate = new Date();
    const diff = currentDate.getTime() - date.getTime();
    if (diff < MILLISECONDS_PER_DAY) {
      if (currentDate.getHours() >= date.getHours()) {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        return `${hours < 10 ? '0' : ''}${hours}:${
          minutes < 10 ? '0' : ''
        }${minutes}h`;
      } else return 'Juče';
    } else if (
      diff < 2 * MILLISECONDS_PER_DAY &&
      currentDate.getHours() >= date.getHours()
    )
      return 'Juče';

    return DAYS[date.getDay()];
  }

  getTime(date: Date): string {
    let hoursInt = date.getHours(),
      hours = `${hoursInt < 10 ? '0' : ''}${hoursInt}`,
      minutesInt = date.getMinutes(),
      minutes = `${minutesInt < 10 ? '0' : ''}${minutesInt}`;

    const currentDate = new Date();
    const diff = currentDate.getTime() - date.getTime();
    if (diff < MILLISECONDS_PER_DAY) {
      if (currentDate.getHours() >= date.getHours()) {
        return `Danas u ${hours}:${minutes}h`;
      }
    }

    return `${date.getMonth()}.${date.getDay()} u ${hours}:${minutes}h`;
  }

  async joinChat() {
    try {
    } catch (err) {
      console.log(err);
      return;
    }
  }

  searchUsers(event: KeyboardEvent) {
    const input = event.key.toLocaleLowerCase();
    if (!ALLOWED_ALPHANUM[input]) return;

    if (input == 'backspace') this.filter = this.filter.slice(0, -1);
    else this.filter += input;

    if (this.filter == '') this.filteredConversations = this.conversations;
    else
      this.filteredConversations = this.conversations.filter(
        (val) =>
          (val.user1 != this.loggedUser.username &&
            val.user1.toLocaleLowerCase().match(this.filter)) ||
          (val.user2 != this.loggedUser.username &&
            val.user2.toLocaleLowerCase().match(this.filter))
      );
  }

  sendMessage() {
    if (this.newMessage.trim() === '') {
      return;
    }

    try {
      const m = new Message(
        6,
        this.loggedUser.username,
        this.selectedConversation.user2,
        this.newMessage,
        new Date(),
        null
      );
      this.selectedConversation.messages = [
        m,
        ...this.selectedConversation.messages,
      ];
      this.selectedConversation.topMessage = m;
      this.filteredConversations = [
        this.selectedConversation,
        ...this.filteredConversations.filter(
          (val) => val != this.selectedConversation
        ),
      ];
      this.conversations = [
        this.selectedConversation,
        ...this.conversations.filter((val) => val != this.selectedConversation),
      ];
      this.selectedIndex = 0;
      this.newMessage = '';
    } catch (err) {
      console.log(err);
    }
  }

  selectConversation(i: number) {
    this.selectedConversation = this.filteredConversations[i];
    this.selectedIndex = i;
  }
}
