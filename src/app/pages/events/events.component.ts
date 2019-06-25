import {Component, OnInit, OnDestroy, HostListener} from '@angular/core';
import {TransportService} from '../../services/transport.service';
import {LoggerService} from '../../services/logger.service';
import {GlobalService} from '../../services/global.service';
import {TranslateService} from '@ngx-translate/core';
import {IEvent} from '../../types/IEvent';

declare const jQuery;

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.less']
})
export class EventsComponent implements OnInit, OnDestroy {


  page: number = 0;
  conditions: any = {_lookup: ''};
  listEvents: IEvent[] = [];
  infiniteScrollWork: boolean = false;
  infiniteScrollDestroy: boolean = false;


  // @HostListener("document:scroll", ["$event"])
  // onListenerTriggered(event: UIEvent): void {
  //
  //    console.log(event);
  // }

  //le.lastick.xd.unitix.cloud/widget/v1/nearest_events?conditions={"tags":["07aeb88a-1732-437c-815e-e569d58364da"],"_lookup":"квартет"}

  constructor(private transport: TransportService,
              private logger: LoggerService,
              private global: GlobalService,
              private translate: TranslateService) {
    this.getEventsList();
  }


  getEventsList(type: string = '') {

    this.transport.getEvents(this.page, this.conditions, 20).subscribe(
      success => {
        this.logger.l(success);
        if (!success.length || success.length < 20) {
          this.infiniteScrollWork = false;
          // this.infiniteScrollDestroy = true;
          this.global.showHideLoader.next(false);
        }

        if (type === 'add') {
          this.listEvents = [...this.listEvents, ...success];
        } else {
          this.listEvents = success;
        }

        this.global.showHideLoader.next(false);
        this.infiniteScrollWork = success.length && success.length >= 20;
      },
      error => {
        this.logger.w(error);
        this.global.showHideLoader.next(false);
      }
    );
  }

  infiniteScroll() {
    this.page++;
    this.getEventsList('add');
  }

  ngOnInit() {
    this.global.showHideLoader.next(true);

    // document.addEventListener('scroll', e => {
    //   if (jQuery(window).scrollTop() === jQuery(document).height() - jQuery(window).height()) {
    //     this.infiniteScroll();
    //   }
    // });
    this.logger.l(this.translate.currentLang);

  }

  selectFilter(tp: string) {
    this.global.showHideLoader.next(true);
    this.logger.l('selectFilter: ' + tp);
    this.page = 0;
    this.infiniteScrollWork = true;
    this.conditions = tp !== 'all' ? {tags: [tp]} : {};
    this.getEventsList();
  }

  searchFilter(txt: string) {
    this.global.showHideLoader.next(true);
    this.logger.l('searchFilter: ' + txt);
    this.page = 0;
    this.conditions = {_lookup: txt};
    this.infiniteScrollWork = true;
    this.getEventsList();
  }

  openEvent(e: IEvent) {
    this.logger.l(e);
    this.global.currentEvent = e;
    sessionStorage.setItem('event', JSON.stringify(e));
  }

  ngOnDestroy() {
    document.removeEventListener('scroll', e => {
    });
  }

}
