import { Injectable } from '@angular/core';
import * as io from 'node_modules/socket.io/client-dist/socket.io.js';
import { Observable } from 'rxjs';
import { Message } from 'src/app/models/message-model/message.model';
import { Notification } from 'src/app/models/notification-models/notification.model';

export enum MESSAGE_EVENTS {
  MESSAGE_POP_UP = 'new-message-pop-up',
  MESSAGE_IN_MESSAGES = 'new-message-in-messages',
}
export enum NOTIFICATION_EVENTS {
  NOTIFICATION_POP_UP = 'new-notification-pop-up',
  NOTIFICATION_IN_NOTIFICATIONS = 'new-notification-in-notifications',
}

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket = null;
  private readonly url: String = 'ws://localhost:5050';

  constructor() {}

  connect(): void {
    this.socket = io(this.url);
  }

  join(username: string, view: string = 'home') {
    console.log(username);
    this.connect();
    this.socket.emit('join', { username, view });
  }

  getMessagesObservable(event: MESSAGE_EVENTS): Observable<Message> {
    return new Observable((observer) => {
      this.socket.on(event, (data) => {
        observer.next(data['content']);
      });
    });
  }

  getNotificationsObservable(
    event: NOTIFICATION_EVENTS
  ): Observable<Notification> {
    return new Observable((observer) => {
      this.socket.on(event, (data) => {
        observer.next(data['content']);
      });
    });
  }
}
