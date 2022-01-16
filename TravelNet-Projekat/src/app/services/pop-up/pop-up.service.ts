import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { Message } from 'src/app/models/message-model/message.model';
import {
  Notification,
  NOTIFICATION_TRANSLATION,
} from 'src/app/models/notification-models/notification.model';
import Swal from 'sweetalert2';
import {
  MESSAGE_EVENTS,
  NOTIFICATION_EVENTS,
  SocketService,
} from '../socket/socket.service';

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
        next: (data) => this.notificationTriggered(data),
        error: (er) => console.log(er),
      });
  }

  stopNotifications(): void {
    if (this.notifications) this.notifications.unsubscribe();
  }

  notificationTriggered(n: Notification) {
    Swal.fire({
      allowOutsideClick: true,
      position: 'top-right',
      width: '100%',
      heightAuto: true,
      padding: '0',
      imageHeight: '2.5em',
      imageWidth: '2.5em',
      imageUrl: `http://localhost:3000/images/${n.type}.svg`,
      html: `<b>${n.from}</b> ${NOTIFICATION_TRANSLATION[n.type]}`,
      showConfirmButton: false,
      backdrop: 'rgba(0,0,0,0)',
      showClass: {
        popup: 'animate__animated animate__flipInX',
      },
      hideClass: {
        popup: 'animate__animated animate__flipOutX',
      },
      timer: 2000,
    });
  }

  messageTriggered(m: Message) {
    Swal.fire({
      allowOutsideClick: true,
      position: 'top-right',
      width: '100%',
      heightAuto: true,
      padding: '0',
      imageHeight: '2.5em',
      imageWidth: '2.5em',
      imageUrl: `http://localhost:3000/images/message.svg`,
      html: `<b>${m.from}</b>: ${m.content}`,
      showConfirmButton: false,
      backdrop: 'rgba(0,0,0,0)',
      showClass: {
        popup: 'animate__animated animate__flipInX',
      },
      hideClass: {
        popup: 'animate__animated animate__flipOutX',
      },
      timer: 2000,
    }).then();
  }
}
