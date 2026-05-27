import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaysListComponent } from './plays-list.component';

describe('PlaysListComponent', () => {
  let component: PlaysListComponent;
  let fixture: ComponentFixture<PlaysListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlaysListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlaysListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
