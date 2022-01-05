import { Injectable } from '@angular/core';
import { map, Subject } from 'rxjs';
import { SocketService } from '../socket/socket.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  notifications: Subject<Notification>;

  constructor(private socketService:SocketService) 
  {
    this.notifications = <Subject<Notification>>this.socketService
    .connect()
    .pipe(map((response: any): Notification =>{return response;}));
  }

  notify(notification: Notification){
    this.notifications.next(notification);
  }
}
