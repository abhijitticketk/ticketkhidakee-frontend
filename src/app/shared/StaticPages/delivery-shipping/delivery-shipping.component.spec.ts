import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryShippingComponent } from './delivery-shipping.component';

describe('DeliveryShippingComponent', () => {
  let component: DeliveryShippingComponent;
  let fixture: ComponentFixture<DeliveryShippingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeliveryShippingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeliveryShippingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
