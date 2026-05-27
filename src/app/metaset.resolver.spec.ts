import { TestBed } from '@angular/core/testing';

import { MetasetResolver } from './metaset.resolver';

describe('MetasetResolver', () => {
  let resolver: MetasetResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(MetasetResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
