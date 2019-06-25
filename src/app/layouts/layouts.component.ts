import {Component, OnInit} from '@angular/core';
import {
  Router,
  NavigationStart,
  NavigationEnd,
  NavigationError,
  NavigationCancel,
  RoutesRecognized
} from '@angular/router';

import {GlobalService} from '../services/global.service';
import {TransportService} from '../services/transport.service';
import {LoggerService} from '../services/logger.service';
import {CartService} from '../services/cart.service';

@Component({
  selector: 'app-layouts',
  templateUrl: './layouts.component.html',
  styleUrls: ['./layouts.component.less']
})
export class LayoutsComponent implements OnInit {
  bgImg = true;
  isSchedulesPage = false;
  event_uuid: any;

  constructor(
    private router: Router,
    private logger: LoggerService,
    public  global: GlobalService,
    private transport: TransportService,
    public cart: CartService) {

    this.global.currentEvent = sessionStorage.getItem('event') ? JSON.parse(sessionStorage.getItem('event')) : undefined;
    // this.global.activeSertificate = sessionStorage.getItem('activeSertificate') ? JSON.parse(sessionStorage.getItem('activeSertificate')) : undefined;
    this.global.cart = sessionStorage.getItem('cart') ? JSON.parse(sessionStorage.getItem('cart')) : undefined;

    this.router.events.subscribe((event: NavigationStart) => {
      if (event instanceof NavigationStart) {
        this.useBg(event.url);
      }
    });

    this.useBg(this.router.url.replace(/\/?\?.*/,''));
  }

  useBg(url: string) {
    const schedulesPage = /\/events\/.+\/schedules/;
    const descriptionPage = /\/events\/.+\/description/;
    const resRegExsSchedulesPage = schedulesPage.exec(url);
    const isEventSchedulePage = resRegExsSchedulesPage ? resRegExsSchedulesPage[0] : false;
    const resRegExsDescriptionPage = descriptionPage.exec(url);
    const isEventDescriptionPage = resRegExsDescriptionPage ? resRegExsDescriptionPage[0] : false;

    switch (url) {
      case '/':
        this.bgImg = true;
        this.isSchedulesPage = false;
        break;
      case '/gift/activate':
        this.bgImg = true;
        this.isSchedulesPage = false;
        break;
      case '/events':
        this.bgImg = false;
        this.isSchedulesPage = false;
        break;
      case '/gift':
        this.bgImg = false;
        this.isSchedulesPage = false;
        break;
      case '/order/confirm':
        this.bgImg = false;
        this.isSchedulesPage = false;
        break;
      case isEventSchedulePage || isEventDescriptionPage  :
        this.isSchedulesPage = true;
        this.bgImg = false;

        if (!this.global.currentEvent) {
          const aUrl = url.split('/');
          this.event_uuid = aUrl[2];

          this.transport.getEvent(this.event_uuid).subscribe(
            s => {
              this.logger.l(s);
              this.global.currentEvent = s;
              const event = this.global.currentEvent;
              if (event.poster !== undefined) {
                this.global.bgImgSchedulesPage = event.poster !== null ? this.global.imgUrl + event.poster.path : '';
              }
              sessionStorage.setItem('event', JSON.stringify(s));
            },
            e => this.logger.e(e)
          );
        } else {
          const event = this.global.currentEvent;
          if (event.poster !== undefined) {
            this.global.bgImgSchedulesPage = event.poster !== null ? this.global.imgUrl + event.poster.path : '';
          }
        }


        break;
      default:
        this.bgImg = false;
        this.isSchedulesPage = false;
        break;
    }
  }

  ngOnInit() {
    this.cart.reloadCart();
  }

}
