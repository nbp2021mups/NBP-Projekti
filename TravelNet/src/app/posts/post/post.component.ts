import { Component, Input, OnInit } from '@angular/core';
import { PostModel } from 'src/app/models/post_models/post.model';
import { LikeModel } from 'src/app/models/post_models/like.model';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit {

  @Input()
  post: PostModel;

  constructor() { }

  ngOnInit(): void { }

  getColor(): string {
    let index = this.post.likes.findIndex((like) => like.likePersonId == this.post.person.id);
    if (index == -1){
      return "black"
    }
    return "warn" 
  }


  onLikeClicked(): void {
    let index = this.post.likes.findIndex((like) => like.likePersonId == this.post.person.id);
    if (index == -1){
      this.post.likes.push(new LikeModel("like4", "p1"));
      // poziv ka bazi
    }
    else {
      this.post.likes.splice(index, 1);
    }
  }

  onCommentsClicked(): void{
    alert("radi");
  }
}
