import {Component, ElementRef, HostListener, Input, OnInit} from '@angular/core';
import {TransportService} from '../../services/transport.service';
import {GlobalService} from '../../services/global.service';
import {prop, isNotNil} from 'ramda';
import {Observable, Subject} from 'rxjs';
import {CartService} from '../../services/cart.service';

@Component({
  selector: 'app-hall-schema-container',
  template: `
      <app-hall-schema [geometry]="geometry" [tickets_data]="ticketsData" [onSelect]="selectSubject" [schedule]="schedule" [selected-tickets]="selectedPlaces" >
      </app-hall-schema>
      <app-hall-schema-sidebar></app-hall-schema-sidebar>
  `,

  styleUrls: ['./hall_schema_container.component.less']
})

export class HallSchemaContainerComponent implements OnInit {
  public schedule: any;
  public  ticketsData: any;
  public  geometry: any;
  public  selectSubject: Subject<any>;
  public selectedPlaces: any;


  constructor(private api: TransportService, private _elemRef: ElementRef, private global: GlobalService, private cartService: CartService) {

  }


  @Input('onSelect')
  set setSelectSubject(cb: Subject<any>) {
    this.selectSubject = cb;
  }

  @Input('schedule')
  set setSchedule(maybeSchedule: any) {
    if (!maybeSchedule) { return; }
    if (prop('uuid', maybeSchedule)) {
      this.schedule = maybeSchedule;

      this.loadData();
    } else {
      this.api.getSchedule(maybeSchedule).subscribe(schedule => {
        this.schedule = schedule;
        this.global.mapInfo.next(schedule);
        this.loadData();
      });
    }
  }

  private loadData() {
    this.global.showHideLoader.next(true);
    this.api.getGeometry(this.schedule.hall_geometry_uuid).subscribe(geometry => this.geometry = geometry);
    this.api.getTickets(this.schedule.uuid).subscribe(ticketsData => {
      this.ticketsData = ticketsData;
      this.global.showHideLoader.next(false);
    });
  }

  ngOnInit() {
    this._elemRef.nativeElement.style.height = `${window.innerHeight - 55}px`;
   // this.selectedPlaces = this.cartService.cart_items.filter((el) => isNotNil(el.ProductItem.Place)).map((el) => el.ProductItem.Place);
  }

  @HostListener('window:resize', ['$event'])
  onResize(ev) {
    this._elemRef.nativeElement.style.height = `${window.innerHeight - 55}px`;
  }

}
