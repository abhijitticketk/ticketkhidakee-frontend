import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogdetailedpageComponent } from './blogdetailedpage.component';

describe('BlogdetailedpageComponent', () => {
  let component: BlogdetailedpageComponent;
  let fixture: ComponentFixture<BlogdetailedpageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BlogdetailedpageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlogdetailedpageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
