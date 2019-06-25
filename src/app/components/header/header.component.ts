import {Component, Input, Output, OnInit, EventEmitter, ViewChild, ElementRef, AfterViewInit} from '@angular/core';
import {Location} from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import {GlobalService} from '../../services/global.service';
import {LoggerService} from '../../services/logger.service';
import {TranslateService} from '@ngx-translate/core';
import {CartService} from '../../services/cart.service';

declare var jQuery: any;
declare var niceSelect: any;

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.less']
})
export class HeaderComponent implements OnInit, AfterViewInit {
  @Input() nameEvent: string;
  @Input() dateEvent: string;
  @Input() placeEvent: string;
  @Input() type: string;
  @Input() title: string;
  @Input() sub_title: string;
  @Output() popupOpen: EventEmitter<any> = new EventEmitter();
  @Output() selectFilter: EventEmitter<any> = new EventEmitter();
  @Output() searchFilter: EventEmitter<any> = new EventEmitter();

  @ViewChild('header') header: ElementRef;
  @ViewChild('dragScroll') dragScroll: any;
  @ViewChild('nav') nav: ElementRef;

  currentPage: string;
  activeItem: any = 'all';
  activeSearch = false;
  searchText: string;
  historyLength = 0;
  fixed = false;
  dragScrollWidth: 320;

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private router: Router,
    private logger: LoggerService,
    public global: GlobalService,
    public cart: CartService,
    public translate: TranslateService
  ) {
    this.logger.l(this.router.url, this.translate.currentLang);
    this.global.mapInfo.subscribe(e => {
      this.nameEvent = e.Event.name[this.translate.currentLang];
      this.dateEvent = e.begin_time;
      this.placeEvent = e.Hall.name[this.translate.currentLang];
    });

    const schedulesPage = /\/events\/.+\/schedules/;
    const descriptionPage = /\/events\/.+\/description/;
    const resRegExsSchedulesPage = schedulesPage.exec(this.router.url);
    const isEventSchedulePage = resRegExsSchedulesPage ? resRegExsSchedulesPage[0] : false;
    const resRegExsDescriptionPage = descriptionPage.exec(this.router.url);
    const isEventDescriptionPage = resRegExsDescriptionPage ? resRegExsDescriptionPage[0] : false;

    switch (this.router.url.replace(/\/?\?.*/, '')) {
      case '/':
        this.currentPage = 'index';
        break;
      case '/gift/activate':
        this.currentPage = 'giftActivate';
        break;
      case '/events':
        this.currentPage = 'events';
        break;
      case '/gift':
        this.currentPage = 'gift';
        break;
      case '/order/confirm':
        this.currentPage = 'orderConfirm';
        break;
      case '/order/activate':
        this.currentPage = 'orderActivate';
        break;
      case isEventSchedulePage || isEventDescriptionPage  :
        this.currentPage = 'event';
        break;
    }

    this.logger.l(this.currentPage);
  }

  back() {
    this.location.back();
  }

  popup() {
    this.popupOpen.emit(null);
  }

  activeFilter(tp: string) {
    this.activeItem = tp;
    this.selectFilter.emit(tp === 'all' ? 'all' : this.global.settings.FilterTags[tp].uuid);
  }

  viewSearch(x: boolean) {
    this.activeSearch = x;
    if (!x) {
      this.searchText = '';
      this.activeItem = 'all';
      this.selectFilter.emit('all');
      this.searchFilter.emit(this.searchText);
    }
  }

  updateSearch(e) {
    if (this.searchText && (this.searchText.length > 2 || this.searchText.length === 0)) {
      this.searchFilter.emit(this.searchText);
    }
  }

  onScroll() {
    const headerH = this.header.nativeElement.clientHeight;
    if (pageYOffset >= (headerH * 2) && !this.fixed) {
      this.fixed = true;
    } else if (pageYOffset < (headerH * 2) && this.fixed) {
      this.fixed = false;
    }
  }

  setDragScrollWidth() {
    this.dragScrollWidth = this.nav.nativeElement.getBoundingClientRect().width;
  }

  ngOnInit() {
    window.addEventListener('scroll', this.onScroll.bind(this));

    // jQuery('.nice-select').niceSelect();
    jQuery(document).ready(function () {
      jQuery('.nice-select').niceSelect();
    });
    this.historyLength = window.history.length;
  }

  ngAfterViewInit() {
    // this.setDragScrollWidth();

    // window.addEventListener('resize', () => {
    //   this.setDragScrollWidth();
    // });
    // console.log(this.nav.nativeElement);
  }
}
