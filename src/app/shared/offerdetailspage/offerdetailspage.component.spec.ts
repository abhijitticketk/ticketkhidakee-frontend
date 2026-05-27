import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfferdetailspageComponent } from './offerdetailspage.component';

describe('OfferdetailspageComponent', () => {
  let component: OfferdetailspageComponent;
  let fixture: ComponentFixture<OfferdetailspageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OfferdetailspageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OfferdetailspageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
