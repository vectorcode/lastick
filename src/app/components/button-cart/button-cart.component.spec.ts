import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonCartComponent } from './button-cart.component';

describe('ButtonCartComponent', () => {
  let component: ButtonCartComponent;
  let fixture: ComponentFixture<ButtonCartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ButtonCartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ButtonCartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
