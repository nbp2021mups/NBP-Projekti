import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/authentication/auth.service';
import { PopUpService } from '../services/pop-up/pop-up.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit, OnDestroy {

  private userSub: Subscription;
  isLoggedIn: boolean;
  private username: string;

  constructor(
    private authService: AuthService,
    private popUpService: PopUpService
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

  onNotificationsClicked(): void {
    alert('radi');
  }

  logout(): void {
    this.authService.logout();
  }

  ngOnDestroy(): void {
    this.userSub.unsubscribe();
  }
}
