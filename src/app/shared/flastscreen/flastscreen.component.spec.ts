import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlastscreenComponent } from './flastscreen.component';

describe('FlastscreenComponent', () => {
  let component: FlastscreenComponent;
  let fixture: ComponentFixture<FlastscreenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlastscreenComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlastscreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
