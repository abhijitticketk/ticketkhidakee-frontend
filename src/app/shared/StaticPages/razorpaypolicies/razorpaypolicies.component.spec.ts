import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RazorpaypoliciesComponent } from './razorpaypolicies.component';

describe('RazorpaypoliciesComponent', () => {
  let component: RazorpaypoliciesComponent;
  let fixture: ComponentFixture<RazorpaypoliciesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RazorpaypoliciesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RazorpaypoliciesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
