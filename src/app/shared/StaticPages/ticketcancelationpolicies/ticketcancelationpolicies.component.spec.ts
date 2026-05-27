import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketcancelationpoliciesComponent } from './ticketcancelationpolicies.component';

describe('TicketcancelationpoliciesComponent', () => {
  let component: TicketcancelationpoliciesComponent;
  let fixture: ComponentFixture<TicketcancelationpoliciesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TicketcancelationpoliciesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TicketcancelationpoliciesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
