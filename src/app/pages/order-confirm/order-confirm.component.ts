import {Component, OnInit, OnDestroy} from '@angular/core';
import {Router} from '@angular/router';
import {TransportService} from '../../services/transport.service';
import {GlobalService} from '../../services/global.service';
import {IInfo} from '../../types/IInfo';
import {ReplaySubject} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {FormBuilder, Validators} from '@angular/forms';

@Component({
    selector: 'app-order-confirm',
    templateUrl: './order-confirm.component.html'
})
export class OrderConfirmComponent implements OnInit, OnDestroy {
    orderForm: any;
    prices: any = {};
    pricesArray: any = [];
    info: any = new ReplaySubject<IInfo>(0);
    name = '';
    nameView = '';
    payments: any = [];
    currentLang = 'ru';
    langSubscribe: any;

    specOffers: any = {};
    specOffersTemplate: any = [];
    serviceMoney = 0;
    priceTotal = 0;

    promo = false;
    popup = false;

    constructor(private transport: TransportService,
                private global: GlobalService,
                private router: Router,
                public translate: TranslateService,
                private formBuilder: FormBuilder,
    ) {
        this.orderForm = this.formBuilder.group({
            'email': ['', [Validators.required, Validators.email]],
            'phone': ['', [Validators.required]],
        });
    }

    popupOpen() {
        this.popup = true;
    }

    buy() {
        if (this.info.email && this.info.phone) {
            localStorage.setItem('info', JSON.stringify(this.info));
            const itemsArray = [];
            for (const priceItem in this.prices) {
                if (this.prices[priceItem]) {
                    itemsArray.push({
                        'cert_config': this.global.certificate,
                        'cert_view': this.global.certificateView,
                        'count': this.prices[priceItem],
                        'price': priceItem
                    });
                }
            }
            this.global.orderGlobal = {
                'items': itemsArray,
                'client': {
                    'email': this.info.email,
                    'phone': this.info.phone,
                },
                'payment_method': this.payments[0]['_uuid']
            };
            if (this.info.hasOwnProperty('addressee_email') && this.info.addressee_email) {
                this.global.orderGlobal.addressee = {
                    email: this.info.addressee_email,
                    phone: this.info.addressee_phone,
                    message: this.info.message,
                    name: this.info.to
                };
                this.global.orderGlobal.client.name = this.info.from;
            }

            this.global.showHideLoader.next(true);

            this.transport.newOrder(JSON.stringify(this.global.orderGlobal)).subscribe(
                success => {
                    window.location.href = success.payment['payment_url'];
                    this.global.showHideLoader.next(false);
                },
                error => {
                    this.global.showHideLoader.next(false);
                }
            );
        } else {
            const controls = this.orderForm.controls;
            Object.keys(controls).forEach(controlName => controls[controlName].markAsTouched());
        }
    }

    ngOnInit() {
        this.specOffers = this.global.specOffers;
        this.serviceMoney = this.global.serviceMoney;
        this.prices = JSON.parse(localStorage.getItem('prices'));
        this.info = JSON.parse(localStorage.getItem('info'));
        this.name = this.info.certificate.name;
        this.nameView = this.info.view.name;

        for (const priceItem in this.prices) {
            if (this.prices[priceItem]) {
                this.pricesArray.push(priceItem);
                this.priceTotal += parseInt(priceItem, 10) * this.prices[priceItem];
            }
        }

        this.langSubscribe = this.global.langChange.subscribe(() => {
            this.currentLang = localStorage.getItem('language');
        });
        if (localStorage.getItem('language')) {
            this.currentLang = localStorage.getItem('language');
        }

        this.global.showHideLoader.next(true);
        this.transport.showcasePaymentMethod().subscribe(
            success => {
                this.payments = success;
                this.global.showHideLoader.next(false);
            },
            error => {
                this.global.showHideLoader.next(false);
            }
        );
    }

    offerMinus(code, event) {
        const specOf = this.specOffers.find(item => item.code === code);

        if (specOf.count >= 1) {
            if (specOf.count === 1) {
                this.specOffersTemplate.splice(this.specOffersTemplate.indexOf(specOf), 1);
            }
            this.specOffers.find(item => item.code === code).count--;
            this.priceTotal -= specOf.price * 100;
        }
    }

    offerPlus(code, event) {
        const specOfTpl = this.specOffersTemplate.find(item => item.code === code);
        const specOf = this.specOffers.find(item => item.code === code);

        if (!specOfTpl) {
            this.specOffersTemplate.push(specOf);
        }
        this.specOffers.find(item => item.code === code).count++;
        this.priceTotal += specOf.price * 100;
    }

    ngOnDestroy() {
        this.langSubscribe.unsubscribe();
    }

}
