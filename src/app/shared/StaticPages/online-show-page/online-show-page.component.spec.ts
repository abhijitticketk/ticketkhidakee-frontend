import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnlineShowPageComponent } from './online-show-page.component';

describe('OnlineShowPageComponent', () => {
  let component: OnlineShowPageComponent;
  let fixture: ComponentFixture<OnlineShowPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OnlineShowPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnlineShowPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
