import {
  Component,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewEncapsulation
} from '@angular/core';
import { event, select, zoom, quadtree, mouse, zoomTransform, zoomIdentity } from 'd3';
import { prop, isNil, isEmpty, path } from 'ramda';
import { IPriceValue, IProductTicket } from '../../types/Entities';
import { Subject, Subscription } from 'rxjs';
import * as palette from 'google-palette';
import { debounceTime } from 'rxjs/operators';
import { DeviceDetectorService } from 'ngx-device-detector';
import {CartService} from '../../services/cart.service';

interface TBoundingBoxGeometry {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface TObjectGeometry {
  w: number;
  h: number;
  cx: number;
  cy: number;
  name?: string;
  uuid?: string;
}

export interface TPlaceInfo extends TObjectGeometry {
  place_view?: any;
  sector: string;
  row: string;
  seat: string;
  price: {
    amount: number;
    currency?: string;
  };
}

interface TRowGeometry {
  places: TObjectGeometry[];
  bb: TBoundingBoxGeometry;
  uuid: string;
  path?: string;
}

interface TFragmentGeometry {
  rows: TRowGeometry[];
  bb: TBoundingBoxGeometry;
  uuid: string;
  path?: string;
}

interface TSectorGeometry {
  uuid: string;
  fragments: TFragmentGeometry[];
  bb: TBoundingBoxGeometry;
  path: string;
}

interface TCustomObjectGeometry {
  uuid: string;
  bb: TBoundingBoxGeometry;
  path?: {value: string, style?: string};
  text?: {value: {ru?: string, en?: string}, style?: string};
}

interface THallGeometry {
  sectors: TSectorGeometry[];
  bb: TBoundingBoxGeometry;
  objects?: TCustomObjectGeometry[];
}

interface TQuadItem {
  x: number;
  y: number;
  uuid: string;
}

enum DeviceType  {
  mobile = 'mobile',
  tablet = 'tablet',
  desktop = 'desktop'
}

@Component({
  selector: 'app-hall-schema',
  template: `
    <svg xmlns="http://www.w3.org/1999/html">
      <defs>
        <filter id="shadow1" x="-40%" y="-40%" width="180%" height="180%">
          <feOffset result="offOut" in="SourceAlpha" dx="0" dy="0" />
          <feGaussianBlur result="blurOut" in="offOut" stdDeviation="5" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.5"/>
          </feComponentTransfer>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g class="wrapper" style="will-change: transform">
        <g class="custom-objects"></g>
        <g class="sectors"></g>
        <g class="interactive"></g>
      </g>
    </svg>
    <app-hall-schema-controls [zoomSubject]="onZoomButtonSource" [infoSubject]="onInfoButtonSource"></app-hall-schema-controls>
    <app-hall-schema-popup [offset]="componentOffset" [onHover]="onHover$"></app-hall-schema-popup>
    <app-hall-schema-legend [prices]="actual_prices" [display]="onInfoButton$"></app-hall-schema-legend>`,
  styleUrls: ['./hall_schema.component.less'],
  encapsulation: ViewEncapsulation.Emulated
})


export class HallSchemaComponent implements OnInit, OnDestroy {


  @Input('schedule') schedule: any;

  private container: HTMLElement;
  private svg: HTMLElement;
  private size: {w: number, h: number};
  private geometry: THallGeometry;
  private object_names: {[uuid: string]: {[lang: string]: string}};
  private tickets_hash: {[place_uuid: string]: IProductTicket[]};
  private prices_hash: {[price_uuid: string]: IPriceValue};
  public actual_prices: {[price_uuid: string]: {amount: number; color: string, uuid: string}};
  private schema: Schema;
  private deviceType: DeviceType;
  public  componentOffset: IPoint;
  private onSelectOutput: Subject<any>;


  public onInfoButtonSource = new Subject<string>();
  public onZoomButtonSource = new Subject<number>();
  private onHoverSource = new Subject<any>();
  private onSelectSource = new Subject<any>();

  public onHover$ = this.onHoverSource.asObservable();
  public onSelect$ = this.onSelectSource.asObservable();

  private onZoomButton$ = this.onZoomButtonSource.asObservable();
  public onInfoButton$ = this.onInfoButtonSource.asObservable();

  private symbols = {
    'hovered': function(options: any, el: SVGGElement, x, y, w, h, color, name?: string) {
      const scale = 1.1;
      const k = select(el);
      const c = k.append('circle')
        .attr('r',  w * scale)
        .attr('cy', 0)
        .attr('cx', 0)
        .attr('fill', `#${color}`)
        .attr('style', `fill: #${color};`);
      if (options.deviceType === DeviceType.desktop && options.browser !== 'safari') {
        c.attr('filter', 'url(#shadow1)');
      } else {
        c.attr('stroke', '#A0A0A0');
      }

      k.append('text')
        .attr('x', 0)
        .attr('y',  0.2 * h)
        .attr('fill', '#ffffff')
        .attr('text-anchor', 'middle')
        .attr('style', `font-size: ${1.2 * h * scale}px; font-weight: 100`)
        .text(name);
    },
    'selected': function(options: any, el, x, y, w, h, color, name?: string) {
      const s = 0.5 * w / 15;
      const k = select(el).append('g')
        .attr('transform', `translate(${-w},${-h})scale(${w / 15})`);

      const c = k.append('circle')
        .attr('transform', 'translate(8.5,6.5)')
        .attr('r', '15')
        .attr('cy', '8.5')
        .attr('cx', '6.5')
        .attr('fill', '#ffffff')
        .attr('style', 'fill: #ffffff');
        if (options.deviceType === DeviceType.desktop && options.browser !== 'safari') {
          c.attr('filter', 'url(#shadow1)');
        } else {
          c.attr('stroke', '#A0A0A0');
        }

      k.append('path')
        .attr('transform', 'translate(8.5,6.5)')
        .attr('d', `m 10.04917,3.5018693 c 0,1.954 -1.5733598,3.50198 -3.5019898,3.50198 -1.92862,0 -3.50198,-1.5733
-3.50198,-3.50198 0,-1.92863 1.57336,-3.50198005 3.50198,-3.50198005 1.92863,0 3.5019898,1.54797005 3.5019898,3.50198005 z
m 3.0452,10.9373497 c 0,2.080891 -13.09436979854815,2.080891 -13.09436979854815,0 0,-3.09596 2.91831999854815,-6.2172897
6.54717999854815,-6.2172897 3.6288698,0 6.5471898,3.1213297 6.5471898,6.2172897 z`)
        .attr('style', `fill:#${color}`);

      return k;
    }
  };

  private subscriptions = [];


  constructor(private _elemRef: ElementRef,
              private deviceService: DeviceDetectorService,
              private renderer: Renderer2,
              private cartService: CartService) {
    this.size = {w: 0, h: 0};
    this.onZoomButton$.subscribe((e) => this.zoomStep(e));
  }

  ngOnInit() {

    this.container = this._elemRef.nativeElement;
    this.componentOffset = this.getOffsetTop();
    if (this.deviceService.isDesktop()) {
      this.deviceType = DeviceType.desktop;
    }
    if (this.deviceService.isMobile()) {
      this.deviceType = DeviceType.mobile;
    }
    if (this.deviceService.isTablet()) {
      this.deviceType = DeviceType.tablet;
    }
    this.svg = this.container.children[0] as HTMLElement;
    this.svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    const options = {
      deviceType: this.deviceType,
      browser: this.deviceService.browser
    };
    console.log(options);
    this.schema = new Schema(
      this.svg,
      options,
      this.onSelect.bind(this),
      this.onHover.bind(this),
      this.symbols
    );
    this.cartService.removeFromCart$.subscribe((cartItem) => {
      this.schema.places[(cartItem.ProductItem as IProductTicket).place_uuid].toggleSelected(false);
    });
    console.log(this._elemRef.nativeElement);
  }

  @Input('onSelect')
  set setSelectCb(cb: Subject<any>) {
    this.onSelectOutput = cb;
  }


  @Input('geometry')
  set setGeometry(data: any) {
    if (!data) { return; }
    console.log('setGeometry', data);

    this.geometry = data.geometry as THallGeometry;
    this.schema.setGeometry(data.geometry);

  }

  @Input('tickets_data')
  set setAvailableTickets(ticketsData: {tickets: IProductTicket[], prices: {[uuid: string]: IPriceValue}}) {

    if (!ticketsData) { return; }
    console.log('setTickets', ticketsData);
    this.prices_hash = ticketsData.prices;
    const {tickets, prices} = ticketsData.tickets.reduce((acc, item) => {
      if (!prop(item.place_uuid, acc.tickets)) {
        acc.tickets[item.place_uuid] = [];
      }
      acc.prices = item.price_values.reduce((pva, pvi) => {
        if (!prop(pvi, pva) && prop(pvi, this.prices_hash)) {
          const price = prop(pvi, this.prices_hash);
          pva[pvi] = {
            uuid: price.uuid,
            amount: price.amount / 100,
            color: undefined
          };
        }
        return pva;
      }, acc.prices);
      acc.tickets[item.place_uuid].push(item);
      return acc;
    }, {tickets: {}, prices: {}});
    this.tickets_hash = tickets;
    const actual_prices = prices;
    const colors = palette('mpn65', Object.keys(prices).length)
      .map((c) => {
        const r = Math.round((parseInt(c.substr(0, 2), 16) + 200) / 2);
        const g = Math.round((parseInt(c.substr(2, 2), 16) + 200) / 2);
        const b = Math.round((parseInt(c.substr(4, 2), 16) + 200) / 2);

        return r.toString(16) + g.toString(16) + b.toString(16);

      });

    this.actual_prices = Object.values(actual_prices).sort((a, b) => prop('amount', a) - prop('amount', b)).reduce((acc, item) => {
      item['color'] = colors.pop();
      acc[item['uuid']] = item;
      return acc;
    }, prices) as {[price_uuid: string]: {amount: number; color: string, uuid: string}};
    this.schema.setPlaces(ticketsData.tickets, this.actual_prices);
  }


  @Input('selected-tickets')
  set selectedTickets(tickets: IProductTicket[]) {

  }

  public zoomStep(n: number) {
    this.schema.zoomStep(n);
  }


  @HostListener('window:resize', ['$event'])
  onResize(ev) {
    this.componentOffset = this.getOffsetTop();
    console.log(this.componentOffset);
    this.schema.resize();
  }

  private getOffsetTop(): IPoint {
    const el = this._elemRef.nativeElement;
    let yPos = el.offsetTop;
    let xPos = el.offsetLeft;
    let nextEl = el.offsetParent;

    while ( nextEl != null ) {
      yPos += nextEl.offsetTop;
      xPos += nextEl.offsetLeft;
      nextEl = nextEl.offsetParent;
    }
    return {x: xPos, y: yPos};
  }

  private onHover(state: boolean, seat_uuid: string, clientXY: IPoint) {
    console.log('hover', state, seat_uuid);
    const ticket = prop(seat_uuid, this.tickets_hash) ? prop(seat_uuid, this.tickets_hash)[0] : null;

    if(!ticket) return;

    const hoveredPlace = {
      uuid: seat_uuid,
      ticket: ticket,
      priceValues: ticket.price_values.map((e) => this.actual_prices[e])
    };

    this.onHoverSource.next({state, placeData: hoveredPlace, clientXY: clientXY});

   /* if(this.hoverCb) {
      this.hoverCb(state, hoveredPlace);
    }*/
  }

  private onSelect(state: boolean, seat_uuid: string, clientXY: IPoint) {
    console.log('select', state, seat_uuid);
    const ticket = path([seat_uuid, 0], this.tickets_hash);
    if(ticket) {
      const selectedPlace = {
        uuid: seat_uuid,
        ticket: ticket,
        priceValues: ticket.price_values.map((e) => this.actual_prices[e])
      };
      this.onSelectOutput.next({state, placeData: selectedPlace});
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(e => e.unsubscribe() );
  }

}

interface ISize {
  w: number;
  h: number;
}

interface IPoint {
  x: number;
  y: number;
  z?: number;
}

class ViewPort {
  private x: number;
  private y: number;
  private scale: number;
  private el: SVGGElement;
  private vpSize: ISize;
  private oldVpSize: ISize;
  private schema: Schema;
  private zoomLevel = 1;
  private worldOffset: IPoint;
  private zoom: number;
  private zoomBehavior;
  private oldOffset: IPoint;
  private state: {
    hovered?: Seat,
  };

  private cursorMoveSource = new Subject<{x: number, y: number}>();
  private cursorMove$ = this.cursorMoveSource.asObservable();

  private panZoomSource = new Subject<{x: number, y: number, k: number}>();
  private panZoom$ = this.panZoomSource.asObservable();

  private seatClickSource = new Subject<Seat>();
  private seatClick$ = this.seatClickSource.asObservable();

  private onHoveredSource = new Subject<any>();
  public  onHovered$ = this.onHoveredSource.asObservable();

  private onSelectSource = new Subject<any>();
  public  onSelect$ = this.onSelectSource.asObservable();

  constructor(schema: Schema, el: SVGGElement, x = 0, y = 0, z = 1) {
    this.x = x;
    this.y = y;
    this.scale = z;
    this.el = el;
    this.schema = schema;
    this.worldOffset = {x: 0, y: 0};
    this.state = {};
    this.oldVpSize = {w: 0, h: 0};
    this.oldOffset = {x: 0, y: 0};
    this.vpSize = this.schema.getSize();
    this.zoomBehavior = zoom()
      .on('zoom', this.onPanZoom.bind(this))
      .on('start', this.zoomStart.bind(this))
      .on('end', this.zoomEnd.bind(this));

    select(this.el.parentElement.parentElement)
      .call(
        this.zoomBehavior
      )
      .on('mousemove', this.onMouseMove.bind(this))
      .on('click', this.onMouseClick.bind(this))
      .on('tap', this.onMouseClick.bind(this))
      .on('dblclick.zoom', null);


    this.seatClick$.subscribe(seat => this.onSeatClick(seat));
    this.panZoom$.subscribe(e => this.doZoom(e));
  }

  public zoomStep(n: number) {
    const s = select(this.el.parentElement.parentElement);
    this.zoomBehavior.scaleTo(s, this.zoomLevel + 0.5 * n);
  }

  public setSize(size: ISize) {
    const w  = this.vpSize ? this.vpSize.w : 0;
    const h  = this.vpSize ? this.vpSize.h : 0;
    this.oldVpSize = {w, h};
    this.vpSize = size;
    this.reset();
  }


  private onMouseMove() {
    const ev = mouse(this.el);
    const evClient = mouse(document.body);
  //  console.log(ev, evClient);
    if (this.schema.geometrySize && ev[0] >= 0
      && ev[0] <= this.schema.geometrySize.w
      && ev[1] >= 0
      && ev[1] <= this.schema.geometrySize.h) {
      this.onCursorMove({x: ev[0], y: ev[1]}, {x: evClient[0], y: evClient[1] });
    }
  }

  private onMouseClick() {
    const ev = mouse(this.el);
    const evClient = mouse(document.body);
    if (this.schema.geometrySize && ev[0] >= 0
      && ev[0] <= this.schema.geometrySize.w
      && ev[1] >= 0
      && ev[1] <= this.schema.geometrySize.h) {
      this.onCursorClick({x: ev[0], y: ev[1] }, {x: evClient[0], y: evClient[1]});
    }
  }

  private onCursorMove(ev: IPoint, clientXY: IPoint, is_selection = false) {
    if (!is_selection) {
      if (this.schema.options.deviceType === DeviceType.desktop) {
        const hovered = this.schema.quadTree.find(ev.x, ev.y, this.schema.minimal_place_size.w);
        if (hovered && hovered.is_active) {
          if (this.state.hovered && hovered.getUUID() !== this.state.hovered.getUUID()) {
            this.state.hovered.setHovered(false);
          }
          if (this.state.hovered && hovered.getUUID() === this.state.hovered.getUUID()) {
            return;
          }
          this.state.hovered = hovered;
          this.state.hovered.setHovered();
          this.onHoveredSource.next({hovered: true, seat_uuid: this.state.hovered.getUUID(), clientXY: clientXY});
        } else {
          if (this.state.hovered) {
            this.state.hovered.setHovered(false);
            this.onHoveredSource.next({hovered: false, seat_uuid: this.state.hovered.getUUID(), clientXY: clientXY});
            this.state.hovered = undefined;
          }
        }
      }
    }
  }

  private onCursorClick(ev: IPoint, clientXY: IPoint, is_selection = false) {
    if (!is_selection) {
      const selected = this.schema.quadTree.find(ev.x, ev.y, this.schema.minimal_place_size.w);
      if (selected) {
        this.seatClickSource.next(selected);
      }
    }
  }

  public update() {
    this.oldOffset.x = this.x;
    this.oldOffset.y = this.y;

    this.el.setAttribute('transform', `translate(${this.x},${this.y})scale(${this.scale * this.zoomLevel})`);
  }

  private reset() {
    this.vpSize = this.schema.getSize();
    this.scale = Math.min(this.vpSize.w / this.schema.geometrySize.w, this.vpSize.h / this.schema.geometrySize.h) * 0.8;
    console.log(this.vpSize.w , this.schema.geometrySize.w);
    const ox = (this.vpSize.w - this.schema.geometrySize.w * this.scale) / 2;
    const oy = (this.vpSize.h - this.schema.geometrySize.h * this.scale) / 2;

    this.oldOffset.x = ox - this.oldOffset.x;
    this.oldOffset.y = oy - this.oldOffset.y;
    const dx = -0.5 * (this.vpSize.w - this.oldVpSize.w) + this.oldOffset.x;
    const dy = -0.5 * (this.vpSize.h - this.oldVpSize.h) + this.oldOffset.y;
    this.zoomBehavior.translateBy(select(this.el.parentElement.parentElement), dx, dy);
    this.zoomBehavior.scaleExtent([1, 9]);
    this.zoomBehavior.constrain((transform, extent, translateExtent) => {
      return this.constrain(transform, extent, translateExtent);
    });
    this.update();
  }

  private constrain(transform, extent, translateExtent) {


    const ox = (this.vpSize.w - this.schema.geometrySize.w * this.scale) / 2;
    const oy = (this.vpSize.h - this.schema.geometrySize.h * this.scale) / 2;

    const screenSchemaSize = {
      w: this.schema.geometrySize.w * this.scale * transform.k,
      h: this.schema.geometrySize.h * this.scale * transform.k
    };

    const max = {
      x: Math.abs(this.vpSize.w - screenSchemaSize.w) / 2,
      y: Math.abs(this.vpSize.h - screenSchemaSize.h) / 2
    };

    const min = {
      x: -(max.x + screenSchemaSize.w - this.vpSize.w),
      y: -(max.y + screenSchemaSize.h - this.vpSize.h)
    };

    console.log(transform.x.toFixed(2), transform.y.toFixed(2),  min, max);

    if (transform.x < min.x ) {
      transform.x = min.x;
    }

    if (transform.x > max.x) {
      transform.x = max.x;
    }


    if (transform.y > max.y) {
      transform.y = max.y;
    }

    if (transform.y < min.y) {
      transform.y = min.y;
    }

    return transform;
  }

  private onPanZoom() {
    const ev = event;
    // console.log(ev.transform);
    this.panZoomSource.next(ev.transform);
  }
  private zoomStart() {
    this.el.parentElement.setAttribute('class', '');
  }

  private zoomEnd() {
    this.el.parentElement.setAttribute('class', 'animate');
  }

  private doZoom(transform: {x: number; y: number; k: number}) {
    this.x = transform.x;
    this.y = transform.y;
    this.zoomLevel = transform.k;
    // console.log(transform, zoomTransform(this.el))
    this.update();
  }

  private onSeatClick(seat: Seat) {
    const state = seat.toggleSelected();
    this.onSelectSource.next({selected: state, seat_uuid: seat.getUUID()});
    console.log('CLICKED ON', seat);
  }


}

class DObject {
  public x: number;
  public y: number;
  public w: number;
  public h: number;
  protected data: any;
  protected parent: any;
  public world: IPoint;
  protected schema: Schema;

  constructor( schema: Schema, x: number, y: number, w: number, h: number, data?: any, parent?: any) {
    this.schema = schema;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.data = data;
    if (!!parent) {
      this.world = {x: this.x + parent.world.x, y: this.y + parent.world.y};
    } else {
      this.world = {x: this.x, y: this.y};
    }
  }
}


export class Schema {
  public viewPort: ViewPort;
  public quadTree: any;
  private childrens: Sector[];
  public places: { [uuid: string]: Seat };
  private svg: HTMLElement;
  public sgContainer: HTMLElement;
  public igContainer: SVGGElement;
  public ogContainer: HTMLElement;
  private viewportElement: SVGGElement;
  private size = { w: 0, h: 0 };
  public geometrySize: ISize;
  private html = '';
  public minimal_place_size: ISize;

  private geoReady = false;
  private colorsReady = false;
  public symbols: {[name: string]: Function};
  public onSelectCb: Function;
  public onHoverCb: Function;
  public options: any;


  constructor(svg: HTMLElement, options: any, onSelectCb: Function, onHoverCb: Function, symbols?: {[name: string]: Function}) {
    this.svg = svg;
    this.getSize();
    this.viewportElement = this.svg.children[1] as SVGGElement;
    this.ogContainer = this.viewportElement.children[0] as HTMLElement;
    this.sgContainer = this.viewportElement.children[1] as HTMLElement;
    this.igContainer = this.viewportElement.children[2] as SVGGElement;
    this.viewPort = new ViewPort(this, this.viewportElement, this.size.w, this.size.h);
    this.places = {};
    this.symbols = symbols;
    this.onSelectCb = onSelectCb;
    this.onHoverCb = onHoverCb;
    this.options = options;
  }

  public setGeometry(geometry: THallGeometry) {
    this.childrens = geometry.sectors.map((s) => new Sector(this, s));
    this.html = this.childrens.reduce((acc, el) => {acc += el.render(); return acc; }, '');
    this.geometrySize = {w: geometry.bb.w, h: geometry.bb.h};
    this.sgContainer.innerHTML = this.html;
    this.ogContainer.innerHTML = (geometry.objects || [])
                                    .map((x) => new CustomObject(this, x).render())
                                    .join('');

    this.getSize();
    console.log(this.size);
    this.viewPort.setSize(this.size);
    this.viewPort.onHovered$.subscribe(e => {
      if (this.onHoverCb) {
        this.onHoverCb(e.hovered, e.seat_uuid, e.clientXY);
      }
    });

    this.viewPort.onSelect$.subscribe((e) => {
      if (this.onSelectCb) {
        this.onSelectCb(e.selected, e.seat_uuid,  e.clientXY);
      }
    });


    this.svg.setAttribute('viewport', `0 0 ${this.size.w} ${this.size.h}`);
    this.quadTree = quadtree<Seat>()
      .x((i) => i.world.x)
      .y((i) => i.world.y)
      .addAll(Object.values(this.places));
    const seats = this.svg.getElementsByClassName('seat');


    const place = Object.values(this.places)[0];
    this.minimal_place_size = {w: place.w, h: place.h};

    for (let i = 0; i < seats.length; i++) {
      const seat_uuid = seats[i].getAttribute('data-uuid');
      this.places[seat_uuid].setElement(seats[i]);
      this.minimal_place_size.w = Math.min(this.minimal_place_size.w, this.places[seat_uuid].w);
      this.minimal_place_size.h = Math.min(this.minimal_place_size.h, this.places[seat_uuid].h);
    }
    this.geoReady = true;
    this.colorize();
  }

  public setPlaces(tickets: IProductTicket[], actualPrices: {[price_uuid: string]: {amount: number; color: string, uuid: string}}) {
    tickets.forEach((t) => {
      if(t.is_for_sale && t.quantity > 0) {
        const p = this.places[t.place_uuid];
        p.setColor(actualPrices[t.price_values[0]].color);
        p.setActive(true);
        if(t.is_in_cart) {
          p.toggleSelected(true);
        }
      }
    });
    this.colorsReady = true;
    this.colorize();
  }

  private colorize() {
    if (!(this.colorsReady && this.geoReady)) { return; }
    Object.values(this.places).forEach((e) => e.update());
  }

  public resize() {
    this.getSize();
    this.viewPort.setSize(this.size);
  }

  public getSize() {
//    const bbox = select(this.svg).node().getBBox();
    console.log(this.svg.parentElement.offsetWidth, this.svg.parentElement.clientWidth);
    const offset =  window.innerHeight - this.svg.clientHeight ||  window.innerHeight;
    this.size.w = this.svg.parentElement.offsetWidth ; // || this.svg.width.baseVal.value;
    this.size.h = window.innerHeight - offset; // || this.svg.height.baseVal.value;
    // this.size = {h: bbox.height, w: bbox.width};
    console.log('getSize', this.size);
    return this.size;

  }

  public zoomStep(n: number) {
    this.viewPort.zoomStep(n);
  }
}

class CustomObject extends DObject {
  private text: {value: {ru?: string, en?: string}, style?: string};
  private path: {value: string, style?: string};

  constructor(schema: Schema, geometry: TCustomObjectGeometry) {
    super(schema, geometry.bb.x, geometry.bb.y, geometry.bb.w * 100, geometry.bb.h * 100, {uuid: geometry.uuid});
    this.text = geometry.text;
    this.path = geometry.path;
  }
  public render() {
    let html = `<g class="custom-object" transform="translate(${this.x},${this.y})">`;
    if (!isNil(this.path)) {
      html += `<path class="custom-object-path" d="${this.path.value}" style="${this.path.style}"></path>`;
    }
    if (!isNil(this.text) && !isEmpty(this.text)) {
      html += `<text style="${this.text.style}">${this.text.value.ru}</text>`;
    }
    html += '</g>';
    return html;
  }
}

class Sector extends DObject {
  private childrens: Fragment[];
  private path: string;

  constructor(schema: Schema, geometry: TSectorGeometry) {
    super(schema, geometry.bb.x, geometry.bb.y, geometry.bb.w, geometry.bb.h, {uuid: geometry.uuid});
    this.path = geometry.path;
    this.childrens = geometry.fragments.map((f) => new Fragment(schema, f, this));

  }

  public render() {
    let sector_html = `<g class="sector" transform="translate(${this.x},${this.y})">`;
    sector_html += `<path class="sector-path" d="${this.path}"></path>`;
    sector_html += this.childrens.reduce((acc, el) => {acc += el.render(); return acc; } , '');
    sector_html += '</g>';
    return sector_html;
  }

}

class Fragment extends DObject {
  private childrens: Row[];
  constructor(schema: Schema, geometry: TFragmentGeometry, parent) {
    super(schema, geometry.bb.x, geometry.bb.y, geometry.bb.w, geometry.bb.h, {uuid: geometry.uuid}, parent);
    this.childrens = geometry.rows.map((r) => new Row(schema, r, this));
  }

  public render() {
    let fragment_html = `<g class="lst-hs_fragment" transform="translate(${this.x},${this.y})">`;
    fragment_html += this.childrens.reduce((acc, el) => {acc += el.render(); return acc; } , '');
    fragment_html += '</g>';
    return fragment_html;
  }
}

class Row extends DObject {
  private childrens: Seat[];
  constructor(schema: Schema, geometry: TRowGeometry, parent) {
    super(schema, geometry.bb.x, geometry.bb.y, geometry.bb.w, geometry.bb.h, {uuid: geometry.uuid}, parent);
    this.childrens = geometry.places.map((p) => new Seat(schema, p, this));
  }
  public render() {
    let row_html = `<g class="lst-hs_row" transform="translate(${this.x},${this.y})">`;
    row_html += this.childrens.reduce((acc, el) => {acc += el.render(); return acc; } , '');
    row_html += '</g>';
    return row_html;
  }
}

class Seat extends DObject {
  protected color = '7f7f7f';
  private inactiveColor = '7f7f7f';
  private uuid: string;
  protected domElement: Element;
  protected is_active = false;
  protected is_hovered = false;
  protected is_selected = false;
  private interactiveElement: SVGGElement;

  constructor(schema: Schema, geometry: TObjectGeometry, parent) {
    super(schema, geometry.cx, geometry.cy, geometry.w, geometry.h, {name: geometry.name, uuid: geometry.uuid}, parent);
    this.uuid = geometry.uuid;
    schema.places[this.uuid] = this;
  }

  public setActive(is_active = true) {
    this.is_active = is_active;
  }

  public setColor(color = '7f7f7f') {
    this.color = color;
   // console.log(this.color);
  }

  public setElement(el: Element) {
    this.domElement = el;
  }

  public setHovered(h = true) {
    this.is_hovered = h;
    this.update();
  }
  public toggleSelected(selected?: boolean) {
    if (selected === undefined) {
      this.is_selected = !this.is_selected;
    } else {
      this.is_selected = selected;
    }
    this.update();
    return this.is_selected;
  }

  public getUUID() {
    return this.uuid;
  }

  public render() {
    let r = this.w / 2;
    if (!this.is_active) {
      r = r * 0.3;
    }
    return `<circle class="seat" data-uuid="${this.uuid}" cx="${this.x}" cy="${this.y}" r="${r}"
fill="#${this.color}" style="fill: #${this.color}"></circle>`;

  }

  public update() {
    let r = this.w / 2;
    let c = this.inactiveColor;
    if (this.is_active) {
      c = this.color;
    } else {
      r = r * 0.3;
    }

    if (this.is_active) {
      if (this.is_selected) {
        const el = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        el.setAttribute('transform', `translate(${this.world.x},${this.world.y})`);
        this.schema.symbols.selected(this.schema.options, el, this.x, this.y, this.w, this.h, this.color, this.data.name);
        this.setInteractiveElement(el);
      } else if (this.is_hovered && this.schema.options.deviceType === DeviceType.desktop) {
        if (this.schema.symbols.hovered) {
          const el = document.createElementNS('http://www.w3.org/2000/svg', 'g');
          el.setAttribute('transform', `translate(${this.world.x},${this.world.y})`);
          this.schema.symbols.hovered(this.schema.options, el, this.x, this.y, this.w, this.h, this.color, this.data.name);
          this.setInteractiveElement(el);
        } else {
          r = 2 * r;
        }
      } else {
        this.setInteractiveElement();
      }
    }

    if (this.interactiveElement && !this.is_hovered && !this.is_selected) {
      this.setInteractiveElement();
    }
    this.domElement.setAttribute('fill', `#${c}`);
    this.domElement.setAttribute('style', `fill:#${c}`);
    this.domElement.setAttribute('r', r.toString());
  }

  private setInteractiveElement(el?: SVGGElement) {
    if (this.interactiveElement) {
      this.interactiveElement.remove();
      this.interactiveElement = undefined;
    }
    if (el) {
      this.interactiveElement = el;
      this.schema.igContainer.appendChild(el);
    }
  }

}

