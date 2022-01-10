import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import axios from 'axios';
import { Subscription } from 'rxjs/internal/Subscription';
import { Conversation } from '../models/conversation-model/conversation.model';
import { FullUser } from '../models/full-user-model/full-user.model';
import { Message } from '../models/message-model/message.model';
import {
  MESSAGE_EVENTS,
  SocketService,
} from '../services/socket/socket.service';

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
export class ChatComponent implements OnInit, OnDestroy {
  public conversations: Conversation[] = Array<Conversation>();
  public filteredConversations: Conversation[] = Array<Conversation>();
  public selectedConversation: Conversation = null;
  public selectedIndex!: number;
  public filter: string = '';
  public loggedUser: FullUser = null;
  public newMessage: string = '';
  public readMsgSubscription: Subscription;
  public receivedMsgSubscription: Subscription;
  constructor(private socketService: SocketService) {}

  ngOnDestroy(): void {
    this.readMsgSubscription.unsubscribe();
    this.receivedMsgSubscription.unsubscribe();
    this.socketService.changeView('default');
  }

  ngOnInit(): void {
    axios
      .get(
        `http://localhost:3000/users/profile/${
          JSON.parse(window.localStorage.getItem('logged-user'))['username']
        }`
      )
      .then((res) => {
        const data = res.data;
        this.loggedUser = new FullUser(
          data.id,
          data.username,
          data.firstName,
          data.lastName,
          data.image,
          data.bio,
          data.joined,
          data.friendsNo,
          data.followedLocationsNo,
          data.postsNo
        );

        axios
          .get(
            `http://localhost:3000/users/conversations/${this.loggedUser.id}/0/${this.loggedUser.friendsNo}`
          )
          .then((result) => {
            result.data.forEach((c) => {
              this.conversations.push(
                new Conversation(c.chatId, c.username, c.image)
              );
            });
            this.filteredConversations = this.conversations;
          });
      });
    this.readMsgSubscription = this.socketService
      .getMessagesObservable(MESSAGE_EVENTS.READ_MESSAGES)
      .subscribe((data) => {
        console.log(data);
        if (
          this.selectedConversation &&
          this.selectedConversation.id == data.chatId
        ) {
          this.selectedConversation.messages.forEach(
            (m) => (m.timeRead = new Date(data.timeRead))
          );
        }
      });
    this.receivedMsgSubscription = this.socketService
      .getMessagesObservable(MESSAGE_EVENTS.MESSAGE_IN_MESSAGES)
      .subscribe((msg) => {
        if (this.conversations.length > 0) {
          if (this.conversations[0].id != msg.chatId) {
            const newTop = this.conversations.find((c) => c.id == msg.chatId);
            this.filteredConversations = [
              newTop,
              ...this.filteredConversations.filter((c) => c.id != msg.chatId),
            ];
            this.conversations = [
              newTop,
              ...this.conversations.filter((c) => c.id != msg.id),
            ];
          }
          this.conversations[0].messages = [
            msg,
            ...this.conversations[0].messages,
          ];
          this.conversations[0].topMessage = msg;
          if (
            this.selectedConversation &&
            this.selectedConversation.id == this.conversations[0].id
          ) {
            msg.timeRead = new Date();
            this.socketService.readMessages({
              chatId: msg.chatId,
              timeRead: msg.timeRead,
              from: msg.from,
              unreadCount: 1,
            });
          } else this.conversations[0].myUnread += 1;
        }
      });
    this.socketService.changeView('messages-tab');
  }

  getDay(dateCal): string {
    if (!dateCal) return '';
    let date = new Date(dateCal);
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

  getTime(dateCal): string {
    if (!dateCal) return '';
    let date = new Date(dateCal);
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

    return `${date.getMonth() + 1}.${date.getDay() + 1} u ${hours}:${minutes}h`;
  }

  searchUsers(event: KeyboardEvent) {
    const input = event.key.toLocaleLowerCase();
    if (!ALLOWED_ALPHANUM[input]) return;

    if (input == 'backspace') this.filter = this.filter.slice(0, -1);
    else this.filter += input;

    if (this.filter == '') this.filteredConversations = this.conversations;
    else
      this.filteredConversations = this.conversations.filter((val) =>
        val.friend.toLocaleLowerCase().match(this.filter)
      );
  }

  @HostListener('window:keydown', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.key == 'Escape') this.deselectConversation();
  }

  deselectConversation() {
    this.selectedConversation = null;
    this.selectedIndex = null;
  }

  sendMessage() {
    if (this.newMessage.trim() === '') {
      return;
    }

    try {
      const m = new Message(
        null,
        this.loggedUser.username,
        this.selectedConversation.friend,
        this.selectedConversation.id,
        this.newMessage,
        new Date(),
        null
      );
      this.newMessage = '';

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
      this.socketService.sendMessage(m);
    } catch (err) {
      console.log(err);
    }
  }

  selectConversation(i: number) {
    this.selectedConversation = this.filteredConversations[i];
    this.selectedIndex = i;

    this.selectedConversation.messages.forEach((m) => {
      if (!m.timeRead) m.timeRead = new Date();
    });
    this.socketService.readMessages({
      chatId: this.selectedConversation.id,
      timeRead: new Date(),
      from: this.selectedConversation.friend,
      unreadCount: this.selectedConversation.myUnread,
    });
    this.selectedConversation.myUnread = 0;
  }
}
