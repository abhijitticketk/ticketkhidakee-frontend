import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingCommonPageComponent } from './booking-common-page.component';

describe('BookingCommonPageComponent', () => {
  let component: BookingCommonPageComponent;
  let fixture: ComponentFixture<BookingCommonPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BookingCommonPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookingCommonPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
