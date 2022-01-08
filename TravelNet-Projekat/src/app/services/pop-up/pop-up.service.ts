import { Injectable } from '@angular/core';
import {
  MESSAGE_EVENTS,
  NOTIFICATION_EVENTS,
  SocketService,
} from '../socket/socket.service';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';
import { Notification } from 'src/app/models/notification-models/notification.model';
import { Message } from 'src/app/models/message-model/message.model';

@Injectable({
  providedIn: 'root',
})
export class PopUpService {
  public messages: Subscription;
  public notifications: Subscription;

  constructor(private socketService: SocketService) {}

  start(username: string): void {
    this.socketService.join(username);
    this.startMessages();
    this.startNotifications();
  }

  stop(): void {
    this.stopMessages();
    this.stopNotifications();
  }

  startMessages(): void {
    this.messages = this.socketService
      .getMessagesObservable(MESSAGE_EVENTS.MESSAGE_POP_UP)
      .subscribe({
        next: (data: Message) => this.messageTriggered(data),
        error: (er) => console.log(er),
      });
  }

  stopMessages(): void {
    if (this.messages) this.messages.unsubscribe();
  }

  startNotifications(): void {
    this.notifications = this.socketService
      .getNotificationsObservable(NOTIFICATION_EVENTS.NOTIFICATION_POP_UP)
      .subscribe({
        next: (data: Notification) => this.notificationTriggered(data),
        error: (er) => console.log(er),
      });
  }

  stopNotifications(): void {
    if (this.notifications) this.notifications.unsubscribe();
  }

  notificationTriggered(n: Notification) {
    console.log(n);
    Swal.fire({
      position: 'top-right',
      title: `${n.type}`,
      icon: 'info',
      html: `<h5>${n.content}</h5>`,
      showConfirmButton: false,
      showClass: {
        popup: 'animate__animated animate__backInRight',
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp',
      },
      timer: 2000,
    });
  }

  messageTriggered(m: Message) {
    console.log(m);
    Swal.fire({
      position: 'top-right',
      title: `${m.from}`,
      imageUrl: 'http://localhost:3000/images/universal.jpg',
      imageHeight: '2.5em',
      imageWidth: '2.5em',
      html: `<h5>${m.content}</h5>`,
      showConfirmButton: false,
      customClass: {
        image: 'pop_up_image',
      },
      showClass: {
        popup: 'animate__animated animate__backInRight',
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp',
      },
      timer: 2000,
    });
  }
}
