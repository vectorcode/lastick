import {Component, OnInit} from '@angular/core';
import {TransportService} from '../../services/transport.service';
import {GlobalService} from '../../services/global.service';
import {Router} from '@angular/router';
import {ValidationService} from '../../services/validation.service';
import {FormBuilder, Validators} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';
import {LoggerService} from '../../services/logger.service';
import {CartService} from '../../services/cart.service';

@Component({
  selector: 'app-gift-activate',
  templateUrl: './gift-activate.component.html'
})
export class GiftActivateComponent implements OnInit {

  logoImage = '';
  certificate = '';
  viewStap = 'inp'; // result
  certificateForm: any;

  // validity_range: any = ['2019-02-01 00:00:00'];
  validity_range: any = [];

  constructor(
    private transport: TransportService,
    private global: GlobalService,
    public cart: CartService,
    private router: Router,
    private formBuilder: FormBuilder,
    private translate: TranslateService,
    private logger: LoggerService
  ) {
    this.certificateForm = this.formBuilder.group({
      // 'test': ['', [Validators.required, ValidationService.numberValidator]],
      'certificate': ['', [Validators.required]]
    });
  }

  ngOnInit() {
    this.logoImage = this.global.logoImage;
  }

  activate() {
    this.global.showHideLoader.next(true);
    this.logger.l(this.certificateForm.value.certificate);

    this.transport.certificateActivate(this.certificateForm.value.certificate).subscribe(
      success => {
        this.cart.reloadCart();
        this.logger.l('Successfully Completed');
        this.logger.l(success);
        // this.global.activeSertificate = success;
        // sessionStorage.setItem('activeSertificate', JSON.stringify(this.global.activeSertificate));
        // this.global.activeSertificate.validity_range.replace(/[)(\]["]/g, '')
        //   .split(/\s*,\s*/)
        //   .map((x) => this.validity_range.push(x));

        this.validity_range = success.validity_range.replace(/[)(\]["]/g, '')
          .split(/\s*,\s*/)
          // .map((x) => this.validity_range.push(x));

        this.viewStap = 'result';
        this.global.showHideLoader.next(false);
      },
      error => {
        this.cart.reloadCart();
        this.logger.l('Error Completed');
        this.logger.l(error);
        this.global.showHideLoader.next(false);
      }
    );
  }


  goEventsPage() {
    this.router.navigate(['/events']);
  }

}
