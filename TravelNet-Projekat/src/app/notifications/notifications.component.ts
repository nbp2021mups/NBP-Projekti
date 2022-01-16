import { HttpClient } from '@angular/common/http';
import {
  Component,
  EventEmitter,
  HostListener,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { DAYS, MILLISECONDS_PER_DAY } from '../chat/chat.component';
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
  isLoading: boolean = false;

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
    this.loadNotifications(this.notifications.length, 20);
  }

  loadNotifications(start: number = 0, count: number = 20) {
    this.isLoading = true;
    this.httpService
      .get(
        `http://localhost:3000/notifications/${this.loggedUser.id}/${start}/${count}`
      )
      .subscribe((data: Array<Notification>) => {
        this.hasMore = count == data.length;
        data.forEach((n) => {
          this.notifications.push(n);
        });
        this.isLoading = false;
      });
  }

  getDescription(n: Notification) {
    return NOTIFICATION_TRANSLATION[n.type];
  }

  getDate(dateStr) {
    if (!dateStr) return '';
    let date = new Date(dateStr);
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

    if (diff < 7 * MILLISECONDS_PER_DAY) return DAYS[date.getDay()];

    const month = date.getMonth() + 1;
    const day = date.getDate() + 1;

    return `${month < 10 ? '0' : ''}${month}.${day < 10 ? '0' : ''}${day}`;
  }
}
