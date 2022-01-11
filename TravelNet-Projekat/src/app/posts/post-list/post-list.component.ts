import { Component, Input, OnInit } from '@angular/core';
import { PostHomePageModel } from 'src/app/models/post_models/post-homepage.model';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit {

  @Input()
  posts: PostHomePageModel[] = [];
  @Input()
  isPersonal: boolean = false;
  @Input()
  profilePosts: boolean = false;

  constructor() { }

  ngOnInit(): void {
    
  }

  onPostDeleted(event: number) {
    const index = this.posts.findIndex(post => post.id == event);
    if(index != -1){
      this.posts.splice(index, 1);
    }
  }
}
