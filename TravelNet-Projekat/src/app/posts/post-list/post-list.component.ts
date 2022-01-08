import { Component, Input, OnInit } from '@angular/core';
import { PostModel } from 'src/app/models/post_models/post.model';
import { LikeModel } from 'src/app/models/post_models/like.model';
import { PersonBasic } from 'src/app/models/person_models/person-basic.model';
import { LocationBasic } from 'src/app/models/location_models/location-basic.model';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit {

  posts: PostModel[] = [];
  
  @Input()
  profilePosts: boolean = false;

  constructor() { }

  ngOnInit(): void {
    
  }

}
