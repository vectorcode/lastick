import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {is, propOr, path} from 'ramda';
import {TranslateService} from '@ngx-translate/core';
import {CartService} from '../../../services/cart.service';

@Component({
  selector: 'app-hall-schema-seatinfo',
  template: `
    <div class="lastick-schema_place-info">
      <div class="place-info">
        <div class="place">{{seat}} {{'HallSchema.SEAT' | translate}}, {{row}} {{ 'HallSchema.ROW' | translate }}<span>{{sector || fragment}}</span></div>
        <div class="price">{{price}} р</div>
      </div>
      <div class="btn-close-area">
        <div class="btn-close" (click)="onRemoveClick()"></div>
      </div>
    </div>
  `,
  styleUrls: ['./seatinfo.component.less']
})

export class HallSchemaSeatinfoComponent implements OnInit, OnChanges {

  @Input('item') item: any;

  public seat: string;
  public row: string;
  public fragment: string;
  public sector: string;
  public price: number;

  constructor(private translateService: TranslateService, private cartService: CartService) {

  }

  ngOnChanges(changes: any) {

  }

  ngOnInit() {
    console.log('ITEM', this.item);
    if (this.item && path(['ProductItem', 'Place', 'meta'], this.item) ) {

      const lang = this.translateService.currentLang;
      this.price = this.item.PriceValue.amount ;
      this.seat = this.item.ProductItem.Place.name;
      this.row = this.item.ProductItem.Place.meta.row.name;
      this.fragment = this.getTranslated(lang, this.item.ProductItem.Place.meta.fragment.name);
      this.sector = this.getTranslated(lang, path(['name'],this.item.ProductItem.Place.meta.sector));
    }
  }

  private getTranslated(lang: string, k: any) {
    if (is(Object, k)) {
      return propOr(k['ru'], lang, k);
    } else {
      return k;
    }
  }

  public onRemoveClick() {
    this.cartService.removeItem(this.item.ProductItem, this.item.PriceValue);
  }
}
