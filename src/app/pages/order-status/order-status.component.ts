import {Component, OnInit, OnDestroy} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {TransportService} from '../../services/transport.service';
import {GlobalService} from '../../services/global.service';

@Component({
  selector: 'app-cart-order-check',
  templateUrl: './order-status.component.html',
  styleUrls: ['./order-status.component.less']
})
export class OrderStatusComponent implements OnInit, OnDestroy {
  order: any;
  data: any;
  status = 'init';
  timer: any = null;
  timeout: any = null;
  successStatuses: Array<string> = ['paid', 'on_delivery', 'done'];
  finalStatuses: Array<string> = [ ...this.successStatuses, 'refund', 'outdated', 'cancelled', 'error'];

  ngOnInit() {
    this.checkOrder();
    this.global.showHideLoader.next(true);

    this.timer = setInterval(() => {
      this.checkOrder();
    }, 2000);

    this.timeout = setTimeout(() => {
      clearInterval(this.timer);
    }, 1000 * 60 * 20);
  }

  constructor(private route: ActivatedRoute,
              // private router: Router,
              private transport: TransportService,
              private global: GlobalService
  ) {
    this.route.params.subscribe(data => {
      this.order = data;
    });
  }

  ngOnDestroy() {
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

    this.transport.getOrder(this.order.order_uuid).toPromise()
      .then(
        (order) => {
          this.status = order.status;
          this.data = order;
          this.checkStatus();
        },
        (err) => {
          this.status = 'error';
          this.global.showHideLoader.next(false);
          this.checkStatus();
        }
      );
  }
}
