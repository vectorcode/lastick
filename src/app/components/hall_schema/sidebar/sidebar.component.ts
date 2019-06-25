import {Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {CartService} from '../../../services/cart.service';
import {Subscription} from 'rxjs';
import {PerfectScrollbarConfigInterface, PerfectScrollbarComponent} from 'ngx-perfect-scrollbar';
import {Router} from "@angular/router";

@Component({
  selector: 'app-hall-schema-sidebar',
  template: `
    <div class="cart-items">
      <div class="sidebar-bg" *ngIf="!items || items.length === 0">
        <div>
          <img src="./assets/img/ticket-placeholder@2x.png"/><br />
          <span>{{ 'HallSchema.SELECT_PLACE_HINT' | translate }}</span>
        </div>
      </div>
      <perfect-scrollbar>
        <app-hall-schema-seatinfo *ngFor="let item of items" [item]="item"></app-hall-schema-seatinfo>
      </perfect-scrollbar>
    </div>
    <div class="cart-summary-wrapper">
      <div class="cart-summary">
        <div class="discount" *ngIf="discountAmount > 0">
          <span>Скидка</span> {{discountAmount}} р
        </div>
        <div class="discount" *ngIf="serviceFee > 0">
          <span>Сервисный сбор</span> {{serviceFee | money}} р
        </div>
        <div class="total">
          <span>Итого</span> {{totalAmount | money}} р
        </div>
      </div>
    </div>
    <div class="cart-button-holder">
      <button class="cart-button"  (click)="goToConfirm()" [attr.disabled]="totalAmount === 0 ? '' : null">
        <span class="regular-text">{{'HallSchema.CHECKOUT' | translate }}</span>
        <span class="variable-text" *ngIf="totalAmount === 0">{{'HallSchema.CHECKOUT' | translate }}</span>
        <span class="variable-text" *ngIf="totalAmount !== 0">{{'HallSchema.CONTINUE_TO_PAYMENT_WITH' | translate:{ticketsCount: items ? items.length : 0, amount: totalAmount / 100} }}</span>
      </button>
    </div>
  `,
  styleUrls: ['./sidebar.component.less']
})

export class HallSchemaSidebarComponent implements OnInit, OnDestroy {

  public discountAmount = 0;
  public totalAmount = 0;
  public items = [];
  public serviceFee = 0;
  private subscriptions: Array<Subscription>;

  constructor(private cartService: CartService, private _elemref: ElementRef, private router: Router) {
    this.subscriptions = [];
    this.subscriptions.push(
      this.cartService.cartOutput$.subscribe(e => this.onCartChange(e))
    );
  }

  public goToConfirm(){
    this.router.navigate(['/order/activate']);
  }

  private onCartChange(e) {
    this.totalAmount = e.total_cost;
    this.items = e.items;
    this.serviceFee = e.service_fee;
    // this.discountAmount = e.discount;
  }

  public ngOnInit() {
    this.cartService.reloadCart();
  }


  ngOnDestroy() {
    this.subscriptions.forEach(e => e.unsubscribe());
  }


}
