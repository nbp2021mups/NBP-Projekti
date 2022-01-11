import { Component, OnDestroy, OnInit } from '@angular/core';
import { Route, Router, Routes } from '@angular/router';
import axios from 'axios';
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
  public TYPE = {
    'post-like': 'Novi lajk',
    'post-comment': 'Novi komentar',
    'sent-friend-request': 'Novi zahtev za prijateljstvo',
    'accepted-friend-request': 'Novi prijatelj',
  };

  constructor(private socketService: SocketService) {}

  ngOnInit(): void {
    this.loggedUser = {
      username: window.localStorage.getItem('logged-user')['username'],
      id: window.localStorage.getItem('logged-user')['id'],
    };
    this.socketService.changeView('notification-tab');
    // axios
    //   .get(`http://localhost:3000/notifications/${this.loggedUser.id}`)
    //   .then((res) => {
    //     res.data.forEach((noti) => {
    //       this.notifications.push(noti);
    //     });
    //   });

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

  getDescription(n: Notification) {
    return NOTIFICATION_TRANSLATION[n.type];
  }

  getDate(dateStr) {
    const date = new Date(dateStr);
    const month = date.getMonth();
    const day = date.getDate();

    return `${day < 10 ? '0' : ''}${day} ${MONTH[month]}`;
  }

  goTo(username: string) {
    window.location.href = `/profile/${username}`;
  }
}
