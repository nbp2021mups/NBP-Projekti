import { Injectable } from '@angular/core';
import * as io from 'node_modules/socket.io/client-dist/socket.io.js';
import { Observable } from 'rxjs';
import {
  Message,
  MessageReadReceipt,
} from 'src/app/models/message-model/message.model';
import { Notification } from 'src/app/models/notification-models/notification.model';

export enum MESSAGE_EVENTS {
  MESSAGE_POP_UP = 'new-message-pop-up',
  MESSAGE_IN_MESSAGES = 'new-message-in-messages',
  READ_MESSAGES = 'read-messages',
}
export enum NOTIFICATION_EVENTS {
  NOTIFICATION_POP_UP = 'new-notification-pop-up',
  NOTIFICATION_IN_NOTIFICATIONS = 'new-notification-in-notifications',
}

export interface View {
  notifications: string;
  messages: string;
}

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private static socket = null;
  private static readonly url: string = 'ws://localhost:5050';

  constructor() {}

  public static getSocket() {
    if (SocketService.socket == null)
      SocketService.socket = io(SocketService.url);
    return SocketService.socket;
  }

  join(
    username: string,
    view: View = { messages: 'home', notifications: 'home' }
  ) {
    SocketService.getSocket().emit('join', { username, view });
  }

  getMessagesObservable(event: MESSAGE_EVENTS): Observable<Message> {
    return new Observable((observer) => {
      SocketService.getSocket().on(event, (data) => {
        observer.next(data['content']);
      });
    });
  }

  getNotificationsObservable(
    event: NOTIFICATION_EVENTS
  ): Observable<Notification> {
    return new Observable((observer) => {
      SocketService.getSocket().on(event, (data) => {
        observer.next(data['content']);
      });
    });
  }

  sendMessage(m: Message) {
    SocketService.getSocket().emit('send-message', m);
  }

  readMessages(receipt: MessageReadReceipt) {
    SocketService.getSocket().emit('read-messages', receipt);
  }

  changeView(view: View) {
    SocketService.getSocket().emit('change-view', { view });
  }

  createNotification(n: Notification) {
    SocketService.getSocket().emit(n.type, n);
  }

  logout() {
    SocketService.getSocket().emit('logout');
  }
}
