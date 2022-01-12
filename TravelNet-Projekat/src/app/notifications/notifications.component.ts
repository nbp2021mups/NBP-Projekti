import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  NOTIFICATION_EVENTS,
  SocketService,
} from '../services/socket/socket.service';
import {
  Notification,
  NOTIFICATION_TRANSLATION,
  NOTIFICATION_TRIGGERS,
} from './../models/notification-models/notification.model';

const MONTH = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Maj',
  'Jun',
  'Jul',
  'Avg',
  'Sep',
  'Okt',
  'Nov',
  'Dec',
];

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css'],
})
export class NotificationsComponent implements OnInit, OnDestroy {
  public loggedUser: { username: string; id: number };
  public notifications: Array<Notification> = new Array<Notification>();
  public hasMore: boolean = false;

  constructor(
    private socketService: SocketService,
    private httpService: HttpClient
  ) {}

  ngOnInit(): void {
    const localSotrageUser = JSON.parse(
      window.localStorage.getItem('logged-user')
    );
    this.loggedUser = {
      id: localSotrageUser['id'],
      username: localSotrageUser['username'],
    };
    this.socketService.changeView('notification-tab');
    this.loadMore();
    this.socketService
      .getNotificationsObservable(
        NOTIFICATION_EVENTS.NOTIFICATION_IN_NOTIFICATIONS
      )
      .subscribe((n) => {
        this.notifications = [n, ...this.notifications];
      });
  }

  ngOnDestroy(): void {
    this.socketService.changeView('default');
  }

  loadMore() {
    this.loadConversations(this.notifications.length, 20);
  }

  loadConversations(start: number = 0, count: number = 20) {
    this.httpService
      .get(
        `http://localhost:3000/notifications/${this.loggedUser.id}/${start}/${count}`
      )
      .subscribe((data: Array<Notification>) => {
        this.hasMore = count == data.length;
        data.forEach((n) => {
          this.notifications.push(n);
        });
      });
  }

  getDescription(n: Notification) {
    return NOTIFICATION_TRANSLATION[n.type];
  }

  getDate(dateStr) {
    const date = new Date(dateStr);
    const month = date.getMonth();
    const day = date.getDate();

    return `${day < 10 ? '0' : ''}${day} ${MONTH[month]}`;
  }

  goToProfile(username: string) {
    window.location.href = `/profile/${username}`;
  }

  goToLocation(id) {
    window.location.href = `locations/${id}`;
  }
}
