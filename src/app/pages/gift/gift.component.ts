import {Component, OnInit, OnDestroy} from '@angular/core';
import {TransportService} from '../../services/transport.service';
import {GlobalService} from '../../services/global.service';
import {LoggerService} from '../../services/logger.service';
import {IInfo} from '../../types/IInfo';
import {ReplaySubject} from 'rxjs';
import {Router} from '@angular/router';
import {FormBuilder, Validators, FormGroup} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-gift',
  templateUrl: './gift.component.html',
  styleUrls: ['./gift.component.less']
})
export class GiftComponent implements OnInit, OnDestroy {
    info: any = new ReplaySubject<IInfo>(0);
    giftForm: any;
    prices: any = [];
    denominationPrice: any;
    priceCount: any = {};
    pricesRange: any = [];
    certificateNumber = 0;
    certificatePrice = 0;
    denominationNumber = 0;
    currentLang = 'ru';
    name: any = {};
    nameView: any = {};
    gift = false;
    popup = false;
    denomination = false;
    langSubscribe: any;

    constructor(private transport: TransportService,
                private global: GlobalService,
                private logger: LoggerService,
                private formBuilder: FormBuilder,
                private router: Router,
                public translate: TranslateService) {
        this.giftForm = this.formBuilder.group({
                'from': [''],
                'to': [''],
                'message': [''],
                'addressee_email': ['', [Validators.email]],
                'email': ['', [Validators.email]],
            },
            {
                'validator': (group: FormGroup): {[key: string]: any} => {
                    let requiredError = false;
                    if (group && group.controls) {
                        const controlName = this.gift ? 'addressee_email' : 'email';
                        // tslint:disable-next-line:max-line-length
                        requiredError = !(group.controls.hasOwnProperty(controlName) && group.controls[controlName].valid && group.controls[controlName].value);
                    }
                    return !requiredError ? null : {'required': true};
                }
            }
        );
    }

    priceMinus(price) {
        if (this.priceCount[price] >= 1) {
            this.certificateNumber--;
            this.certificatePrice -= parseInt(price, 10);
            this.priceCount[price]--;
        }
    }

    pricePlus(price) {
        this.certificateNumber++;
        this.certificatePrice += parseInt(price, 10);
        this.priceCount[price]++;
    }

    denominationMinus(price) {
        if (this.denominationPrice && this.denominationNumber >= 1) {
            this.denominationNumber--;
        }
    }

    denominationPlus(price) {
        if (this.denominationPrice) {
            this.denominationNumber++;
        }
    }

    denominationChange() {
        if (this.denominationPrice) {
            if (this.pricesRange[0] && this.denominationPrice < this.pricesRange[0] / 100) {
                this.denominationPrice = this.pricesRange[0] / 100;
            }
            if (this.pricesRange[1] && this.denominationPrice > this.pricesRange[1] / 100) {
                this.denominationPrice = this.pricesRange[1] / 100;
            }
        } else {
            this.denominationNumber = 0;
        }
    }

    popupOpen() {
        this.popup = true;
    }

    onChange() {
        this.gift = !this.gift;
    }

    onSubmit() {
        const controls = this.giftForm.controls;
        if (this.giftForm.invalid || (!this.certificateNumber && !this.denominationNumber)) {
            this.logger.w('onSubmit -->');
            this.logger.w('invalid form data or certificates selection');
            Object.keys(controls).forEach(controlName => controls[controlName].markAsTouched());
            return;
        }
        if (this.denominationPrice && this.denominationNumber) {
            if (this.priceCount[this.denominationPrice * 100]) {
                this.priceCount[this.denominationPrice * 100] += this.denominationNumber;
            } else {
                this.priceCount[this.denominationPrice * 100] = this.denominationNumber;
            }
        }
        localStorage.setItem('prices', JSON.stringify(this.priceCount));
        localStorage.setItem('info', JSON.stringify(this.info));
        this.router.navigate(['/order/confirm']);
    }

    ngOnInit() {
        this.langSubscribe = this.global.langChange.subscribe(() => {
            if (localStorage.getItem('language')) {
                this.currentLang = localStorage.getItem('language');
            }
        });
        if (localStorage.getItem('language')) {
            this.currentLang = localStorage.getItem('language');
        }
        this.global.showHideLoader.next(true);
        this.transport.showcaseList().subscribe(
            success => {
                const certificate = success.find(item => item._uuid === this.global.certificate);
                const view = certificate['Views'].find(item => item._uuid === this.global.certificateView);

                this.name = certificate.name;
                this.nameView = view.name;

                this.info.certificate = certificate;
                this.info.view = view;

                this.prices = certificate.prices;
                if (certificate.prices_range && certificate.prices_range.length && (certificate.prices_range[0] || certificate.prices_range[1])) {
                    this.denomination = true;
                    this.pricesRange = certificate.prices_range;
                }

                for (const price in this.prices) {
                    this.priceCount[this.prices[price]] = 0;
                }
                this.global.showHideLoader.next(false);
            },
            error => {
                console.log('Error Completed');
                this.global.showHideLoader.next(false);
            }
        );
    }

    ngOnDestroy() {
        this.langSubscribe.unsubscribe();
    }

}
