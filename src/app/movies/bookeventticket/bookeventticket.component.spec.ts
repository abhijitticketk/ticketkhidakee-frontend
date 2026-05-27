import { ComponentFixture, TestBed } from '@angular/core/testing';

import { bookeventticketComponent } from './bookeventticket.component';

describe('bookeventticketComponent', () => {
  let component: bookeventticketComponent;
  let fixture: ComponentFixture<bookeventticketComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ bookeventticketComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(bookeventticketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
