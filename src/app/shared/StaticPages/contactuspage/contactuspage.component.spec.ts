import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactuspageComponent } from './contactuspage.component';

describe('ContactuspageComponent', () => {
  let component: ContactuspageComponent;
  let fixture: ComponentFixture<ContactuspageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContactuspageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactuspageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
