import {
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
  OnDestroy,
  HostListener,
} from '@angular/core';
import { PostHomePageModel } from '../models/post_models/post-homepage.model';

@Component({
  selector: 'app-post-view',
  templateUrl: './post-view.component.html',
  styleUrls: ['./post-view.component.css'],
})
export class PostViewComponent implements OnInit, OnDestroy {
  @Input()
  public post: PostHomePageModel;

  @Input()
  startY: number;

  @Output()
  viewClosed: EventEmitter<void> = new EventEmitter<void>();

  private inside: boolean = false;

  constructor() {}

  ngOnDestroy(): void {
    this.onCloseView();
  }

  @HostListener('click', ['$event'])
  clickInside(event) {
    this.inside = true;
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event) {
    if (!this.inside) event.stopPropagation();
    this.inside = false;
  }

  ngOnInit(): void {
    window.scrollTo({
      top: Number.MAX_SAFE_INTEGER,
      left: 0,
      behavior: 'smooth',
    });
    window.document.body.style.overflow = 'hidden';
  }

  onCloseView() {
    window.scrollTo({
      top: this.startY,
      left: 0,
      behavior: 'smooth',
    });
    window.document.body.style.overflow = 'auto';
    this.viewClosed.emit();
  }
}
