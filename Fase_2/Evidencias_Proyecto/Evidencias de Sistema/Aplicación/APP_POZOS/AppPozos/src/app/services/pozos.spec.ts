import { TestBed } from '@angular/core/testing';

import { Pozos } from './pozos.service';

describe('Pozos', () => {
  let service: Pozos;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Pozos);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
