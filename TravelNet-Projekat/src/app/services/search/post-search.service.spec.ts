import { TestBed } from '@angular/core/testing';

import { PostSearchService } from './post-search.service';

describe('PostSearchService', () => {
  let service: PostSearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PostSearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
