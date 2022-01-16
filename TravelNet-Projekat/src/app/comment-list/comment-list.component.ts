import { HttpClient } from '@angular/common/http';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Comment } from './../models/comment/comment';
import { SocketService } from '../services/socket/socket.service';
import { PostHomePageModel } from '../models/post_models/post-homepage.model';

@Component({
  selector: 'app-comment-list',
  templateUrl: './comment-list.component.html',
  styleUrls: ['./comment-list.component.css'],
})
export class CommentListComponent implements OnInit, OnDestroy {
  @Input()
  public post: PostHomePageModel;

  public loggedUser: { username: string; id: number };

  public comments: Array<Comment> = new Array<Comment>();

  public hasMore: boolean = false;

  constructor(private httpService: HttpClient) {}

  ngOnDestroy(): void {
    this.comments = null;
  }

  ngOnInit(): void {
    this.loggedUser = JSON.parse(window.localStorage.getItem('logged-user'));
    this.loadMore();
  }

  public loadMore() {
    this.loadComments(this.comments.length, 10);
  }

  public deleteComment(comment: Comment) {
    this.httpService
      .delete(`http://localhost:3000/comments/${comment.id}`)
      .subscribe((res) => {
        this.comments = this.comments.filter((c) => c.id != comment.id);
        this.post.commentsNo -= 1;
      });
  }

  public sendComment(event) {
    if (event.target.value == '') return;
    this.httpService
      .post(`http://localhost:3000/comments`, {
        userId: this.loggedUser.id,
        postId: this.post.id,
        comment: event.target.value,
      })
      .subscribe({
        next: (res: any) => {
          this.comments = [
            new Comment(
              res.commentId,
              this.loggedUser.username,
              event.target.value,
              new Date()
            ),
            ...this.comments,
          ];
          event.target.value = '';
          this.post.commentsNo += 1;
        },
        error: (err) => console.log(err),
      });
  }

  public loadComments(start: number = 0, count: number = 20) {
    this.httpService
      .get(`http://localhost:3000/comments/${this.post.id}/${start}/${count}`)
      .subscribe({
        next: (data: Array<Comment>) => {
          this.hasMore = data.length == count;
          data.forEach((c) => {
            this.comments.push(c);
          });
        },
        error: (er) => console.log(er),
      });
  }
}
