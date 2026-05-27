import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommomListPageComponent } from './commom-list-page.component';

describe('CommomListPageComponent', () => {
  let component: CommomListPageComponent;
  let fixture: ComponentFixture<CommomListPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommomListPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommomListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
