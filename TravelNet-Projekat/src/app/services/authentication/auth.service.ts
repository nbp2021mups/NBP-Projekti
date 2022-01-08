import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from 'src/app/models/user.model';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';

interface LoginData {
  id: number;
  username: string;
  token: string;
  expiration: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  user: BehaviorSubject<User> = new BehaviorSubject<User>(null);
  private tokenTimer: any;

  constructor(private http: HttpClient, private router: Router) {}

  register(
    fName: string,
    lName: string,
    email: string,
    username: string,
    password: string,
    desc: string,
    image: File
  ) {
    const reqData: FormData = new FormData();
    reqData.append('firstName', fName);
    reqData.append('lastName', lName);
    reqData.append('email', email);
    reqData.append('username', username);
    reqData.append('password', password);
    reqData.append('image', image);
    reqData.append('bio', desc);

    return this.http.post('http://localhost:3000/users/register', reqData, {
      responseType: 'text',
    });
  }

  login(username: string, password: string) {
    return this.http
      .post<LoginData>('http://localhost:3000/users/login', {
        username: username,
        password: password,
      })
      .pipe(
        tap((respData) => {
          const expDate = new Date(
            new Date().getTime() + respData.expiration * 60 * 1000
          );
          const user = new User(
            respData.id,
            respData.username,
            respData.token,
            expDate
          );
          this.user.next(user);
          this.autoLogout(respData.expiration * 60 * 1000);
          localStorage.setItem('logged-user', JSON.stringify(user));
        })
      );
  }

  logout() {
    this.user.next(null);
    this.router.navigate(['/login']);
    localStorage.removeItem('logged-user');

    if (this.tokenTimer) {
      clearTimeout(this.tokenTimer);
    }
  }

  autoLogin() {
    const loggedUser: {
      id: number;
      username: string;
      _token: string;
      _tokenExpDate: Date;
    } = JSON.parse(localStorage.getItem('logged-user'));
    if (!loggedUser) {
      return;
    }

    const user = new User(
      loggedUser.id,
      loggedUser.username,
      loggedUser._token,
      new Date(loggedUser._tokenExpDate)
    );
    if (!user.token) {
      return;
    }

    this.user.next(user);
    const expTimer =
      new Date(loggedUser._tokenExpDate).getTime() - new Date().getTime();
    this.autoLogout(expTimer);
  }

  autoLogout(timer: number) {
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, timer);
  }
}
