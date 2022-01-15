import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/authentication/auth.service';
import { ExploreService } from '../services/explore/explore.service';
import { PopUpService } from '../services/pop-up/pop-up.service';
import { SocketService } from '../services/socket/socket.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  private userSub: Subscription;
  public displayNotifications: boolean = false;
  isLoggedIn: boolean;
  private username: string;

  constructor(
    private authService: AuthService,
    private popUpService: PopUpService,
    private socketSer: SocketService,
    public exploreService: ExploreService
  ) {}

  ngOnInit(): void {
    this.userSub = this.authService.user.subscribe((user) => {
      if (user) {
        this.isLoggedIn = true;
        this.popUpService.start(user.username);
        this.username = user.username;
      } else {
        this.isLoggedIn = false;
        this.popUpService.stop();
      }
    });
  }

  toggleNotifications(): void {
    this.displayNotifications = !this.displayNotifications;
  }

  logout(): void {
    this.authService.logout();
    this.socketSer.logout();
  }

  ngOnDestroy(): void {
    this.userSub.unsubscribe();
  }

  @HostListener('document:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    if (event.key == 'Escape') this.exploreService.searchToggle = false;
  }
}
