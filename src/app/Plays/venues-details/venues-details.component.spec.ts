import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VenuesDetailsComponent } from './venues-details.component';

describe('VenuesDetailsComponent', () => {
  let component: VenuesDetailsComponent;
  let fixture: ComponentFixture<VenuesDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VenuesDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VenuesDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
