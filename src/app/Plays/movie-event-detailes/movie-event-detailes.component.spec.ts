import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MovieEventDetailesComponent } from './movie-event-detailes.component';

describe('MovieEventDetailesComponent', () => {
  let component: MovieEventDetailesComponent;
  let fixture: ComponentFixture<MovieEventDetailesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MovieEventDetailesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MovieEventDetailesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
