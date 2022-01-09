import { Component, Input, OnInit } from '@angular/core';
import { PostHomePageModel } from 'src/app/models/post_models/post-homepage.model';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit {

  posts: PostHomePageModel[] = [];
  
  @Input()
  profilePosts: boolean = false;

  constructor() { }

  ngOnInit(): void {
    
  }

}
