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
    let imgPath: string = "https://image.shutterstock.com/image-photo/motivational-words-llc-on-keyboard-600w-1910672659.jpg";
    let perImg: string = "https://image.shutterstock.com/image-photo/motivational-words-llc-on-keyboard-600w-1910672659.jpg";
    let likes: LikeModel[] = [];
    likes.push(new LikeModel("like2", "p2"));
    likes.push(new LikeModel("like2", "p3"));
    let post = new PostModel("post1234", new PersonBasic("p1", "Uros", "Pesic", perImg, [], []), new LocationBasic("l1", "Paralia"), imgPath, likes);
    for(let i = 0; i < 5; i++){
      this.posts.push(post);
    }
  }

}
