import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PostHomePageModel } from 'src/app/models/post_models/post-homepage.model';
import { PostsService } from 'src/app/services/posts.service';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit {

  @Input()
  post: PostHomePageModel;

  @Input()
  isPersonal: boolean = false;

  @Output()
  postDeleted: EventEmitter<number> = new EventEmitter<number>();

  editDesc: boolean = false;
  form: FormGroup;

  constructor(private postsService: PostsService) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      desc: new FormControl('', Validators.required)});
    this.form.get('desc').setValue(this.post.desc);
  }

  getColor(): string {
    if (!this.post.liked){
      return "black"
    }
    return "warn" 
  }

  onDeletePost() {
    this.postsService.deletePost(this.post.id).subscribe({
      next: resp => {
        alert(resp);
        this.postDeleted.emit(this.post.id);
      },
      error: err => {console.log(err);}
    });
  }

  onEditDescription() {
    this.editDesc = !this.editDesc;
  }

  onLikeClicked(): void {
    if(!this.post.liked) {
      return;
    } else {
      return;
    }

    this.post.liked = !this.post.liked;
  }

  onSubmit() {
    if (this.form.invalid){
      return;
    }

    const newDesc = this.form.get('desc').value;
    this.postsService.updateDescription(this.post.id, newDesc).subscribe({
      next: resp => {
        alert(resp);
        this.post.desc = newDesc;
        this.editDesc = false;
      },
      error: err => {console.log(err);}
    });
  }

  onCommentsClicked(): void{
    alert("radi");
  }
}
