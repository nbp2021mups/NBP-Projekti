import { HttpClient } from '@angular/common/http';
import {
  Component,
  EventEmitter,
  HostListener,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
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
  @Output() destroy = new EventEmitter<boolean>();
  public loggedUser: { username: string; id: number };
  public notifications: Array<Notification> = new Array<Notification>();
  public hasMore: boolean = false;
  private inside: boolean = true;

  constructor(
    private socketService: SocketService,
    private httpService: HttpClient
  ) {}

  @HostListener('click')
  clickInside() {
    this.inside = true;
  }

  @HostListener('document:click')
  clickOutside() {
    if (!this.inside) this.destroy.emit(true);
    this.inside = false;
  }

  ngOnInit(): void {
    const localSotrageUser = JSON.parse(
      window.localStorage.getItem('logged-user')
    );
    this.loggedUser = {
      id: localSotrageUser['id'],
      username: localSotrageUser['username'],
    };
    this.socketService.changeView({
      messages: null,
      notifications: 'notification-tab',
    });
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
    this.socketService.changeView({ notifications: 'home', messages: null });
  }

  deleteNotification(i: number) {
    this.httpService
      .delete(`http://localhost:3000/notifications/${this.notifications[i].id}`)
      .subscribe(() => {
        this.notifications = this.notifications.filter((val, ind) => ind != i);
      });
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
