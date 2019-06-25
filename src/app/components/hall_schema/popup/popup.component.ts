import {Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, Renderer2, ViewEncapsulation} from '@angular/core';
import {Observable, ObservableInput, Subscription} from 'rxjs';
import {IProductTicket} from '../../../types/Entities';
import {DeviceDetectorService} from 'ngx-device-detector';
import {TranslateService} from '@ngx-translate/core';
import {propOr, prop, is} from 'ramda';




@Component({
  selector: 'app-hall-schema-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.less'],
  encapsulation: ViewEncapsulation.Emulated,
})

export class HallSchemaPopupComponent implements OnInit, OnDestroy, OnChanges {

  private subscriptions = Array<Subscription>();
  public hasPlaceView = false;
  public placeView: any;
  public seat: string;
  public row: string;
  public fragment: string;
  public sector: string;
  public price: string;

  @Input('offset') parentOffset: {x: number, y: number};
  @Input('onHover') hover$: Observable<any>;

  constructor(private deviceService: DeviceDetectorService, private translateService: TranslateService, private _elemRef: ElementRef) {

  }

  ngOnInit() {

  }

  ngOnDestroy() {
    this.subscriptions.forEach((e) => e.unsubscribe());
  }

  ngOnChanges(changes) {
    if(changes["hover$"] && this.hover$) {
      this.subscriptions.push(
        this.hover$.subscribe(td => {
          this.display(td);
        })
      );
    }
  }


  private display(t: any) {
    if(!t.state) {
      this.hide();
    } else {
      const lang = this.translateService.currentLang;
      const meta = t.placeData.ticket.Place.meta;
      const h = document.body.clientHeight;
      const w = document.body.clientWidth;;
      console.log(t.clientXY, this.parentOffset);


      let x = t.clientXY.x - this.parentOffset.x;
      if (t.clientXY.x + this._elemRef.nativeElement.clientWidth  + this.parentOffset.x > w) {
        x = w - this._elemRef.nativeElement.clientWidth  - this.parentOffset.x;
      }
      let y = t.clientXY.y - this.parentOffset.y;
      if(t.clientXY.y + this._elemRef.nativeElement.clientHeight + this.parentOffset.y > h) {
        y = h - 2*this._elemRef.nativeElement.clientHeight - this.parentOffset.y;
      }

      this.seat = this.getTranslated(lang, t.placeData.ticket.Place.name);
      this.row = this.getTranslated(lang, meta.row.name);
      this.fragment = this.getTranslated(lang, meta.fragment.name);
      this.sector = this.getTranslated(lang, prop('name', meta.sector));
      this.price = t.placeData.priceValues[0].amount;
      this._elemRef.nativeElement.style.left = x + 'px';
      this._elemRef.nativeElement.style.top = y + 'px';
      this._elemRef.nativeElement.style.visibility = 'visible';

    }
    console.log(t, this.translateService.currentLang);
  }

  private getTranslated(lang: string, k: any) {
    if (is(Object, k)) {
      return propOr(k['ru'], lang, k);
    } else {
      return k;
    }
  }

  private hide() {
    this._elemRef.nativeElement.style.visibility = 'hidden';
  }
}


