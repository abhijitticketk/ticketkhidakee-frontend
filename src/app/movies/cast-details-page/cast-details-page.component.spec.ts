import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CastDetailsPageComponent } from './cast-details-page.component';

describe('CastDetailsPageComponent', () => {
  let component: CastDetailsPageComponent;
  let fixture: ComponentFixture<CastDetailsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CastDetailsPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CastDetailsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
