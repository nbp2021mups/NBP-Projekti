import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { PostHomePageModel } from '../models/post_models/post-homepage.model';

@Component({
  selector: 'app-post-view',
  templateUrl: './post-view.component.html',
  styleUrls: ['./post-view.component.css']
})
export class PostViewComponent implements OnInit {

  @Input()
  post: PostHomePageModel

  @Input()
  startY: number;

  @Output()
  viewClosed: EventEmitter<void> = new EventEmitter<void>();

  constructor() { }

  ngOnInit(): void {
  }

  onCloseView(){
    this.viewClosed.emit();
  }
}
