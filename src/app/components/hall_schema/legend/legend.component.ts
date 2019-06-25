import {Component, ElementRef, Input, OnChanges, OnDestroy, OnInit} from '@angular/core';
import {prop} from 'ramda';
import {Observable, Subscription} from 'rxjs';

@Component({
  selector: 'app-hall-schema-legend',
  template: `
    <perfect-scrollbar>
      <div class="common-places">
        <div class="place-item" *ngFor="let price of prices">
          <span class="icon"><span [ngStyle]="{'background-color': '#' + price.color}" ></span></span>
          <span class="text">{{price.amount}} р</span>
        </div>
        <div class="place-item busy">
          <span class="icon"><span></span></span>
          <span class="text">{{'HallSchema.TAKEN_PLACE' | translate }}</span>
        </div>
      </div>
      <div class="advanced-places">
        <div class="place-item selected">
          <span class="icon"><span></span></span>
          <span class="text">{{'HallSchema.SELECTED_PLACES' | translate }}</span>
        </div>
      </div>
      <div class="info">
        <div class="service">По вопросам работы сервиса обращайтесь по телефону или email</div>
        <div class="phone">+7 495 120-42-64</div>
        <div class="email">support@lastick.ru</div>
      </div>
    </perfect-scrollbar>
      <div class="header">
        <div class="btn-close" (click)="close($event)">
        </div>
      </div>
    
  `,
  styleUrls: ['./legend.component.less']
})

export class HallSchemaLegendComponent implements OnInit, OnChanges, OnDestroy {

  @Input('prices') actual_prices: any;
  @Input('display') displayTrigger: Observable<void>;
  public prices = [];
  private display = false;
  private subscription: Subscription;

  constructor(private _elemRef: ElementRef) {
    this.display = false;
  }

  ngOnInit() {
    if (this.displayTrigger) {
      this.subscription = this.displayTrigger.subscribe(() => {
        this.display = true;
        this.doDisplay();
      });
    }
  }

  ngOnChanges(changes: any) {
    console.log(changes)
    if (changes['actual_prices'] && changes['actual_prices'].currentValue) {
      this.prices = Object.values(this.actual_prices).sort((a,b) => { return prop('amount', a) - prop('amount', b) });
    }
    if(changes['displayTrigger'] && this.displayTrigger && !this.subscription) {
        this.subscription = this.displayTrigger.subscribe(() => {
          this.display = true;
          this.doDisplay();
        });
    }
  }

  private doDisplay() {
    if (this.display) {
      this._elemRef.nativeElement.style.left = 0;
      // this._elemRef.nativeElement.style.opacity = 1;
    } else {
      this._elemRef.nativeElement.style.left = '101%';
      // this._elemRef.nativeElement.style.opacity = 0;
    }
  }

  public close(ev) {
    this.display = false;
    this.doDisplay();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }


}
