import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { PlayersService } from './players'; // Asegúrate que exporta PlayersService

describe('PlayersService', () => {
  let service: PlayersService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    }).compileComponents();

    service = TestBed.inject(PlayersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});