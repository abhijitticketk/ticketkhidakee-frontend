import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketpageComponent } from './ticketpage.component';

describe('TicketpageComponent', () => {
  let component: TicketpageComponent;
  let fixture: ComponentFixture<TicketpageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TicketpageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TicketpageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
