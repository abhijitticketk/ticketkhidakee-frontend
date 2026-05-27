import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventDetailesComponent } from './event-detailes.component';

describe('EventDetailesComponent', () => {
  let component: EventDetailesComponent;
  let fixture: ComponentFixture<EventDetailesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventDetailesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventDetailesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
