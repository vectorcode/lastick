import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {TransportService} from '../../services/transport.service';
import {LoggerService} from '../../services/logger.service';
import {GlobalService} from '../../services/global.service';
import {TranslateService} from '@ngx-translate/core';
import {IPriceValue, IProductTicket} from '../../types/Entities';
import {CartService} from '../../services/cart.service';
import {Subject} from 'rxjs';
import { isNil } from 'ramda';

@Component({
  selector: 'app-event-map',
  templateUrl: './event-map.component.html',
  styleUrls: ['./event-map.component.less']
})
export class EventMapComponent implements OnInit {
    public schedule_uuid: string;
    public event_uuid: string;
    public onSelectSubject = new Subject<any>();

    public nameEvent: string;
    public dateEvent: string;
    public placeEvent: string;

    constructor(private route: ActivatedRoute,
                private router: Router,
                private logger: LoggerService,
                private api: TransportService,
                private cartService: CartService,
                public global: GlobalService,
                private translate: TranslateService) {

      this.route.params.subscribe(data => {
        this.schedule_uuid = data.schedule_uuid;
        this.event_uuid = data.event_uuid;
      });
      this.onSelectSubject.asObservable().subscribe(e => this.onSelect(e.state, e.placeData));
    }

    ngOnInit() {
      this.cartService.cartOutput$.subscribe(e => console.log(e));
      // this.nameEvent = this.global.currentEvent.name[this.translate.currentLang];
      // this.dateEvent = this.global.currentEvent.NearestSchedule.begin_time;
      // this.placeEvent = this.global.currentEvent.NearestSchedule.Hall.name[this.translate.currentLang];
    }

    public onSelect(state: any, placeData: any) {
      console.log('EVENT MAP PAGE', state, placeData);
      if(state) {
        if(!isNil(placeData.ticket) && !isNil(placeData.priceValues)) {
          this.cartService.addItem(placeData.ticket, placeData.priceValues[0]);
        }
      } else {
        this.cartService.removeItem(placeData.ticket);
      }

    }

}
