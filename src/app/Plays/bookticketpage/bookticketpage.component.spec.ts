import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookticketpageComponent } from './bookticketpage.component';

describe('BookticketpageComponent', () => {
  let component: BookticketpageComponent;
  let fixture: ComponentFixture<BookticketpageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BookticketpageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookticketpageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
