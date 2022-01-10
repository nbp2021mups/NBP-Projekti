import { Component, Input, OnInit } from '@angular/core';
import { PostHomePageModel } from 'src/app/models/post_models/post-homepage.model';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit {

  @Input()
  post: PostHomePageModel;

  constructor() { }

  ngOnInit(): void { }

  getColor(): string {
    if (!this.post.liked){
      return "black"
    }
    return "warn" 
  }


  onLikeClicked(): void {
    this.post.liked = !this.post.liked;
  }

  onCommentsClicked(): void{
    alert("radi");
  }
}
