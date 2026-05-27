import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaysDetailsComponent } from './plays-details.component';

describe('PlaysDetailsComponent', () => {
  let component: PlaysDetailsComponent;
  let fixture: ComponentFixture<PlaysDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlaysDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlaysDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
