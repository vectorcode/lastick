import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {TransportService} from '../../services/transport.service';
import {LoggerService} from '../../services/logger.service';
import {GlobalService} from '../../services/global.service';
import {InfoService} from '../../services/info.service';
import {TranslateService} from '@ngx-translate/core';
import {IEvent} from '../../types/IEvent';
import {ITickets} from '../../types/ITickets';
import {Subscription} from 'rxjs';
import {CartService} from '../../services/cart.service';
import {prop} from 'ramda';

declare var jQuery: any;
declare var niceSelect: any;

@Component({
    selector: 'app-event-table',
    templateUrl: './event-table.component.html',
    styleUrls: ['./event-table.component.less']
})
export class EventTableComponent implements OnInit, OnDestroy {
    event_uuid: any;
    eDt: IEvent;
    listEvents: IEvent[];
    aTickets: any = {tickets: [], prices: {}};
    cartView: any;
    subscriptions: Subscription[] = [];
    date = new Date();
    dateInp: any;
    dayEvent = {
        today: {
            active: true,
            date: this.date
        },
        tomorrow: {
            active: false,
            date: this.date.setDate(this.date.getDate() + 1)
        },
        calendar: {
            active: false,
            selectDate: ''
        }
    };
    cartTotalItems = 0;
    cartTotalCost = 0;
    aCalendarDate: any;
    selectOpt = [];

    private schedulesByDate;


    constructor(private route: ActivatedRoute,
                private router: Router,
                private transport: TransportService,
                private logger: LoggerService,
                public global: GlobalService,
                private translate: TranslateService,
                public cart: CartService,
                private info: InfoService) {

        this.route.params.subscribe(data => {
            this.event_uuid = data.event_uuid;

            //this.router.navigate(['']);
            //NearestSchedule.uuid
        });

        //const saveEvent = JSON.parse(sessionStorage.getItem('event'));
        this.eDt = this.global.currentEvent;
        this.logger.l('Event -->');
        this.logger.l(this.eDt);

        this.cart.cartOutput$.subscribe(e => {
            console.log('from cart', e)
            this.cartTotalItems = e.total_items;
            this.cartTotalCost = e.total_cost / 100;
        });


    }

    addTicket(itm) {
        this.cart.addItem(itm, itm.price_values[0]);


        if (this.cartView[itm.uuid].count < 100) {
            this.cartView[itm.uuid].count++;
            this.logger.l(this.cartView);


            /*
                        const addItemCart = this.transport.addItemCart(itm.uuid, itm.price_values[0]).subscribe(
                            success => {
                                this.logger.l('addItemCart -->');
                                this.logger.l(success);
                                this.updateInfoCart();
                            },
                            error => {
                                this.logger.w(error);
                                this.cartView[itm.uuid].count--;
                            }
                        );
                        this.subscriptions.push(addItemCart);
            */
        } else {
            this.info.showError('Осталось 0 билетов');
        }

    }

    dellTicket(itm) {
        this.cart.removeItem(itm);


        if (this.cartView[itm.uuid].count >= 1) {
            this.cartView[itm.uuid].count--;
            this.logger.l('---------');
            this.logger.l(this.cartView);
            this.logger.l(itm);
            let cartUiid = '';
            // this.cart.removeItem()
            /*
                        this.global.cart.items.map(i => {
                           if(i.product_item === itm.uuid){
                               cartUiid = i.uuid;
                           }
                        });

                        const dellItemCart = this.transport.dellItemCart(cartUiid/*UUID позиции корзины*/
            /*).subscribe(
                          success => {
                               this.logger.l('dellItemCart -->');
                               this.logger.l(success);
                               this.updateInfoCart();
                           },
                           error => {
                               this.logger.w(error);
                               this.cartView[itm.uuid].count++;
                           }
                       );

                       this.subscriptions.push(dellItemCart);
                       */
        }

    }

    updateInfoCart() {
        const getCart = this.transport.getCart().subscribe(
            success => {
                this.logger.l('Cart -->');
                this.logger.l(success);
                this.global.cart = success;
                sessionStorage.setItem('cart', JSON.stringify(this.global.cart));

                this.global.cart.items.map(el => {
                    if (this.cartView[el.product_item]) {
                        console.log(this.cartView[el.product_item]);
                        //if(this.cartView[el.product_item] === el.product_item){
                        this.cartView[el.product_item].count++;
                        //}
                    }
                });
            },
            error => {
                this.logger.w(error);

            }
        );

        this.subscriptions.push(getCart);
    }

    activeDay(e: string) {

        let searchDate = new Date();

        for (let i in this.dayEvent) {
            this.dayEvent[i].active = false;
        }
        this.dayEvent[e].active = true;


        switch (e) {
            case 'today':
                searchDate = new Date();
                break;
            case 'tomorrow':
                searchDate = new Date(searchDate.setDate(searchDate.getDate() + 1));
                break;
            case  'calendar':
                // searchDate  = this.dateInp;
                break;
        }

        if (e !== 'calendar') {
            this.equalDate(searchDate);
        }
    }

    equalDate(searchDate) {
        this.logger.w('searchDate -->');
        this.logger.l(searchDate);

        this.selectOpt  =  this.schedulesByDate[this.getYYMMDD(searchDate)] ? Object.keys(this.schedulesByDate[this.getYYMMDD(searchDate)]) : [];
        //console.warn(this.selectOpt);

        let aEvents = [];
        const
            searchDateY = searchDate.getFullYear(),
            searchDateM = searchDate.getMonth(),
            searchDateD = searchDate.getDate();

        for (let k = 0; k < this.listEvents.length; k++) {
            const beginTimeAll = new Date(this.listEvents[k].begin_time),
                beginTimeY = beginTimeAll.getFullYear(),
                beginTimeM = beginTimeAll.getMonth(),
                beginTimeD = beginTimeAll.getDate();


            if (searchDateY + '-' + searchDateM + '-' + searchDateD === beginTimeY + '-' + beginTimeM + '-' + beginTimeD) {
                aEvents.push(this.listEvents[k].uuid);
            }
        }

        this.logger.l('select events -->');
        this.logger.l(aEvents);
        this.getTickets(aEvents[0]);
        this.updateInfoCart();
    }

    dateInpChange(e) {
        console.log(e, 'Date change');

        this.equalDate(e);
    }

    getTickets(uuid = this.eDt.NearestSchedule.uuid) {
        this.global.showHideLoader.next(true);
        const getTickets = this.transport.getTickets(uuid).subscribe(
            success => {
                this.logger.l(success);
                this.cartView = success.tickets;

                success.tickets.map(i => {
                    this.cartView[i.uuid.toString()] = {count: 0};
                });

                this.aTickets = success;

                this.global.showHideLoader.next(false);
            },
            error => {
                this.logger.w(error);
                this.global.showHideLoader.next(false);
            }
        );
        this.subscriptions.push(getTickets);
    }

    sortDates(a, b) {
        return a.getTime() - b.getTime();
    }

    getYYMMDD(date) {
        return date.getFullYear() + '-' + ((date.getMonth() + 1).toString().length === 1 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1)) + '-' + (date.getDate().toString().length === 1 ? '0' + date.getDate() : date.getDate());
    }

    ngOnInit() {
        jQuery('.nice-select').niceSelect();

        this.getTickets();

        const getEventsTickets = this.transport.getEventsTickets(this.event_uuid).subscribe(
            success => {
                this.logger.l('listEvents -->');
                this.logger.l(success);
                this.listEvents = success;
            },
            error => {
                this.logger.w(error);
            }
        );
        this.subscriptions.push(getEventsTickets);

        this.transport.getSchedules(this.event_uuid).subscribe(
            schedules => {
                this.schedulesByDate = schedules.reduce((acc, s) => {
                    const dateKey = s.begin_time.replace(/[T\s].+/, '');
                    const timeKey = s.begin_time.replace(/[\d\-]+[T\s]+(.{5}).+/, '$1') +
                        '-' + s.end_time.replace(/[\d\-]+[T\s]+(.{5}).+/, '$1');
                    if (!prop(dateKey, acc)) {
                        acc[dateKey] = {};
                    }
                    if (!prop(timeKey, acc[dateKey])) {
                        acc[dateKey][timeKey] = [];
                    }
                    acc[dateKey][timeKey].push(s);
                    return acc;
                }, {});
                this.logger.l(this.schedulesByDate);

                const aSortDt = Object.keys(this.schedulesByDate);

                this.selectOpt  =  this.schedulesByDate[this.getYYMMDD(this.date)] ? Object.keys(this.schedulesByDate[this.getYYMMDD(this.date)]) : [];
                //console.warn(this.selectOpt);
                // const aDt = [];
                // aSortDt.map( i => aDt.push(new Date(i));
                // const sorted = aDt.sort(this.sortDates);
                // const minDate = sorted[0];
                // const maxDate = sorted[sorted.length-1];

                jQuery.fn.datepicker.language['en'] = {
                    days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                    daysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                    daysMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
                    months: ['January','February','March','April','May','June', 'July','August','September','October','November','December'],
                    monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                    today: 'Today',
                    clear: 'Clear',
                    dateFormat: 'mm/dd/yyyy',
                    timeFormat: 'hh:ii aa',
                    firstDay: 0
                };

                jQuery('.datepickerHere').datepicker({
                    language: this.translate.currentLang,
                    //inline: true,
                    position: "bottom right",
                    onSelect: (formattedDate, date, inst) => {
                        this.dateInpChange(date);
                    },
                    onRenderCell: (date, cellType) => {
                        const currentDate = this.getYYMMDD(date);
                        if (cellType === 'day' && aSortDt.indexOf(currentDate) !== -1) {
                            return {disabled: false}
                        } else {
                            return {disabled: true}
                        }
                    }
                });
            }
        )


        this.updateInfoCart();
    }

    ngOnDestroy() {
        this.subscriptions.forEach(item => item.unsubscribe());
    }

}
