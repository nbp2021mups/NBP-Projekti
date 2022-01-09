import { Component, Input, OnInit } from '@angular/core';
import { PostHomePageModel } from 'src/app/models/post_models/post-homepage.model';
import { LikeModel } from 'src/app/models/post_models/like.model';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit {

  @Input()
  post: PostHomePageModel;
  liked: boolean = false;

  constructor() { }

  ngOnInit(): void { }

  getColor(): string {
    if (!this.liked){
      return "black"
    }
    return "warn" 
  }


  onLikeClicked(): void {
    this.liked = !this.liked;
  }

  onCommentsClicked(): void{
    alert("radi");
  }
}
