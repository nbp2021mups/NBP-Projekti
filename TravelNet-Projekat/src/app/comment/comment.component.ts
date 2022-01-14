import { Component, Input, OnInit } from '@angular/core';
import { DAYS, MILLISECONDS_PER_DAY } from '../chat/chat.component';
import { AuthService } from '../services/authentication/auth.service';
import { Comment } from './../models/comment/comment';

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.css'],
})
export class CommentComponent implements OnInit {
  @Input() comment: Comment;
  @Input() postId: number;
  @Input() postedUsername: string;

  allowDel: boolean = false;
  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.user.subscribe(user => {
      if(user.username == this.comment.from || user.username == this.postedUsername){
        this.allowDel = true;
      } else {
        this.allowDel = false;
      }
    }).unsubscribe();
  }

  getDate(dateStr) {
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
