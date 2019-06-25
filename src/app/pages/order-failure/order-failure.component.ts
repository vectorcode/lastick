import {Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {TransportService} from '../../services/transport.service';
import {GlobalService} from '../../services/global.service';

@Component({
    selector: 'app-order',
    templateUrl: './order-failure.component.html'
})
export class OrderFailureComponent {
    order: any;
    status: string;

    constructor(private route: ActivatedRoute,
                private router: Router,
                private transport: TransportService,
                private global: GlobalService) {
        this.route.params.subscribe(data => {
            // this.order = data;
            this.global.showHideLoader.next(true);
            this.transport.showcaseOrder(this.order.order_uuid).subscribe(
                success => {
                    this.status = success.status;
                    this.order = success;
                    this.global.showHideLoader.next(false);
                },
                error => {
                  this.status = 'error';
                  this.order = error;
                  this.global.showHideLoader.next(false);
                }
            );
        });
    }

}
