import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonTicketPageComponent } from './common-ticket-page.component';

describe('CommonTicketPageComponent', () => {
  let component: CommonTicketPageComponent;
  let fixture: ComponentFixture<CommonTicketPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommonTicketPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommonTicketPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
