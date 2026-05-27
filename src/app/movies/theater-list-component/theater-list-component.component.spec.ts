import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TheaterListComponentComponent } from './theater-list-component.component';

describe('TheaterListComponentComponent', () => {
  let component: TheaterListComponentComponent;
  let fixture: ComponentFixture<TheaterListComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TheaterListComponentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TheaterListComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
