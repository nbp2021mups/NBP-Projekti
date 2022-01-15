import { Component, Input, OnInit } from '@angular/core';
import { PostHomePageModel } from 'src/app/models/post_models/post-homepage.model';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css'],
})
export class PostListComponent implements OnInit {
  @Input()
  posts: PostHomePageModel[] = [];
  @Input()
  profilePosts: boolean = false;

  public post: PostHomePageModel = null;
  startY: number;

  constructor() {}

  ngOnInit(): void {}

  onPostClicked(post, event) {
    this.post = post;
    let pos = event - screen.height / 2;
    this.startY = pos >= 62 ? pos : 62;
    console.log(this.post);
  }

  closeView() {
    window.setTimeout(() => (this.post = null), 500);
  }

  onPostDeleted(event: number) {
    const index = this.posts.findIndex((post) => post.id == event);
    if (index != -1) {
      this.posts.splice(index, 1);
    }
  }
}
