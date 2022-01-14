import { TestBed } from '@angular/core/testing';

import { ConversationSearchService } from './conversation-search.service';

describe('ConversationSearchService', () => {
  let service: ConversationSearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConversationSearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
