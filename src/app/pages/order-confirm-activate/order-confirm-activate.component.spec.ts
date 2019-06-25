import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderConfirmActivateComponent } from './order-confirm-activate.component';

describe('OrderConfirmActivateComponent', () => {
  let component: OrderConfirmActivateComponent;
  let fixture: ComponentFixture<OrderConfirmActivateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrderConfirmActivateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderConfirmActivateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
