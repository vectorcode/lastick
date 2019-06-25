import {Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {TransportService} from '../../services/transport.service';
import {GlobalService} from '../../services/global.service';

@Component({
  selector: 'app-order-cert-status',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.less']
})
export class OrderCertStatusComponent implements OnInit, OnDestroy, AfterViewInit {
  order: any;
  data: any;
  items: any;
  status = 'init';
  timer: any = null;
  timeout: any = null;
  successStatuses: Array<string> = ['done', 'paid', 'on_delivery'];
  finalStatuses: Array<string> = [ ...this.successStatuses, 'refund', 'cancel', 'outdated', 'error'];

  dragScrollWidth: number;

  @ViewChild('wrap') wrap: ElementRef;

  constructor(private route: ActivatedRoute,
              // private router: Router,
              private transport: TransportService,
              private global: GlobalService
  ) {
    this.route.params.subscribe(data => {
      this.order = data;
    });
  }

  ngOnInit() {
    this.checkOrder();
    this.global.showHideLoader.next(true);

    this.timer = setInterval(() => {
      this.checkOrder();
    }, 2000);

    this.timeout = setTimeout(() => {
      clearInterval(this.timer);
    }, 1000 * 60 * 20);
    //  1000 * 60 * 20
  }

  ngAfterViewInit() {
    this.setDragScrollWidth();

    window.addEventListener('resize', this.setDragScrollWidth.bind(this));
  }

  ngOnDestroy() {
  }

  setDragScrollWidth() {
    const windowWidth = window.innerWidth;
    const wrapWidth = this.wrap.nativeElement.getBoundingClientRect().width;

    this.dragScrollWidth = wrapWidth + ((windowWidth - wrapWidth) / 2);
  }

  isValidStatus() {
    return this.finalStatuses.indexOf(this.status) >= 0;
  }

  checkStatus() {
    const isValidStatus = this.isValidStatus();
    if (isValidStatus) {
      clearInterval(this.timer);
      clearTimeout(this.timeout);
      this.global.showHideLoader.next(false);
    }
    return isValidStatus;
  }

  checkSuccess() {
    return this.successStatuses.indexOf(this.status) >= 0;
  }

  checkOrder() {
    if(this.checkStatus()) return;

    this.transport.showcaseOrder(this.order.order_uuid).toPromise()
      .then(
        (order) => {
          this.status = order.status;
          this.data = order;
          this.items = order.items;
          this.checkStatus();
        },
        (err) => {
          this.status = 'error';
          // this.status = 'done';
          this.global.showHideLoader.next(false);
          this.checkStatus();
        }
      );
  }
}
