import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PostHomePageModel } from 'src/app/models/post_models/post-homepage.model';
import { AuthService } from 'src/app/services/authentication/auth.service';
import { PostsService } from 'src/app/services/posts.service';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit {

  @Input()
  post: PostHomePageModel;

  isPersonal: boolean = false;

  @Output()
  postDeleted: EventEmitter<number> = new EventEmitter<number>();

  editDesc: boolean = false;

  @Input()
  showImage: boolean = false;

  @Output()
  imageClicked: EventEmitter<number> = new EventEmitter<number>();

  @Input()
  commDisabled: boolean = false;

  form: FormGroup;

  constructor(private postsService: PostsService, private authService: AuthService) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      desc: new FormControl('', Validators.required)});
    this.form.get('desc').setValue(this.post.desc);

    this.authService.user.subscribe(user => {
      if (user.id == this.post.person.id){
        this.isPersonal = true;
      } else {
        this.isPersonal = false;
      }
    }).unsubscribe();
  }

  getColor(): string {
    if (!this.post.liked){
      return "black"
    }
    return "warn"
  }

  onDeletePost() {
    this.postsService.deletePost(this.post.id, this.post.imagePath).subscribe({
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
      this.authService.user.subscribe(user => {
        this.postsService.likePost(user.id, this.post.id).subscribe({
          next: resp => {
            this.post.liked = !this.post.liked;
            this.post.likesNo++;
          },
          error: err => {console.log(err);}
        });
      }).unsubscribe();
    } else {
      this.authService.user.subscribe(user => {
        this.postsService.unlikePost(user.id, this.post.id).subscribe({
          next: resp => {
            this.post.liked = !this.post.liked;
            this.post.likesNo--;
          },
          error: err => {console.log(err);}
        });
      }).unsubscribe();
    }
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


  onImageClick(event) {
    if(this.commDisabled)
      return;
    this.imageClicked.emit(event.pageY);
  }


  onCommentsClicked(event): void{
    this.imageClicked.emit(event.pageY);
  }
}
