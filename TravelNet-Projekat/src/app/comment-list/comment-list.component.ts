import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { Comment } from './../models/comment/comment';
import { SocketService } from '../services/socket/socket.service';

@Component({
  selector: 'app-comment-list',
  templateUrl: './comment-list.component.html',
  styleUrls: ['./comment-list.component.css'],
})
export class CommentListComponent implements OnInit {
  @Input() postId: number;
  public comments: Array<Comment> = new Array<Comment>();
  public hasMore: boolean = false;
  public loggedUser: { username: string; id: number };
  constructor(
    private httpService: HttpClient,
    private socketService: SocketService
  ) {}

  public loadMore() {
    this.loadComments(this.comments.length, 3);
  }

  public sendComment(event) {
    if (event.target.value == '') return;
    this.httpService
      .post(`http://localhost:3000/comments`, {
        userId: this.loggedUser.id,
        postId: this.postId,
        comment: event.target.value,
      })
      .subscribe({
        next: () => {
          this.comments = [
            new Comment(
              0,
              this.loggedUser.username,
              event.target.value,
              new Date()
            ),
            ...this.comments,
          ];
          event.target.value = '';
        },
        error: (err) => console.log(err),
      });
  }

  public loadComments(start: number = 0, count: number = 20) {
    this.httpService
      .get(`http://localhost:3000/comments/${this.postId}/${start}/${count}`)
      .subscribe({
        next: (data: Array<Comment>) => {
          console.log(data);
          this.hasMore = data.length == count;
          data.forEach((c) => this.comments.push(c));
        },
        error: (er) => console.log(er),
      });
  }

  ngOnInit(): void {
    this.loggedUser = JSON.parse(window.localStorage.getItem('logged-user'));
    this.loadMore();
  }
}
