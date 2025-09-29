import { TestBed } from '@angular/core/testing';

import { Matches } from './matches';

describe('Matches', () => {
  let service: Matches;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Matches);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
