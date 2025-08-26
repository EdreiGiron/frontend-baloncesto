import { TestBed } from '@angular/core/testing';

import { RealtimeServiceTs } from './realtime.service.ts';

describe('RealtimeServiceTs', () => {
  let service: RealtimeServiceTs;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RealtimeServiceTs);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
