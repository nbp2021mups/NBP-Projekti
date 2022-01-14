import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

export const NO_FILTER = '@NoFilter';
@Injectable({
  providedIn: 'root',
})
export abstract class SearchService {
  protected pattern: string;
  protected start: number;
  protected count: number;
  protected hasMore: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );
  protected loggedUser: { username: string; id: number };

  constructor(protected http: HttpClient) {
    this.loggedUser = JSON.parse(window.localStorage.getItem('logged-user'));
  }

  initialLoad(pattern: string, count: number) {
    this.pattern = pattern;
    this.count = count;
    this.start = 0;
    this.loadMore();
  }

  abstract loadMore(): void;

  abstract getIncoming(): Observable<Array<Object>>;

  getHasMore(): Observable<boolean> {
    return this.hasMore.asObservable();
  }
}
