import { TestBed } from '@angular/core/testing';

import { ChattingService } from './chatting.service';

describe('ChattingService', () => {
  let service: ChattingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChattingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
