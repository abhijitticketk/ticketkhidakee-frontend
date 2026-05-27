import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TheaterDetailsPageComponent } from './theater-details-page.component';

describe('TheaterDetailsPageComponent', () => {
  let component: TheaterDetailsPageComponent;
  let fixture: ComponentFixture<TheaterDetailsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TheaterDetailsPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TheaterDetailsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
