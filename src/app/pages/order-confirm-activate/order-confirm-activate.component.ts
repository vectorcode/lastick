import {Component, OnInit, OnDestroy, ViewChild, ElementRef} from '@angular/core';
import {TransportService} from '../../services/transport.service';
import {GlobalService} from '../../services/global.service';
import {TranslateService} from '@ngx-translate/core';
import {LoggerService} from '../../services/logger.service';
import {ValidationService} from '../../services/validation.service';
import {FormBuilder, Validators} from '@angular/forms';
import {CartService} from '../../services/cart.service';

@Component({
  selector: 'app-order-confirm-activate',
  templateUrl: './order-confirm-activate.component.html',
  styleUrls: ['./order-confirm-activate.component.less']
})
export class OrderConfirmActivateComponent implements OnInit {
  @ViewChild('emailInput') emailInput: ElementRef;

  orderForm: any;
  cart: any;
  lang: any;
  collapse = true;
  private cartItems;

  constructor(private transport: TransportService,
              public global: GlobalService,
              public translate: TranslateService,
              private logger: LoggerService,
              private formBuilder: FormBuilder,
              public cartService: CartService) {
    this.orderForm = this.formBuilder.group({
      'email': ['', [Validators.required, ValidationService.emailValidator]],
      'phone': ['', [Validators.required, ValidationService.phoneValidator]]
    });
    this.lang = {
      'payment_methods': {
        'title': {
          'en': 'Payment Methods',
          'ru': 'Способы оплаты'
        }
      }
    };

    // this.collapse = this.cartService.cart_items && this.cartService.cart_items.length > 1;
  }

  ngOnInit() {
    this.cartItems = this.cartService.cart_items;
    this.cartService.cartOutput$.subscribe((e) => {
      this.collapse = e.items.length > 1;
      this.cartItems = e.items;
    });
    this.cartService.syncCart();
  }

  getPlaceSeats(index) {
    const ticket = this.cartItems[index];
    const place = ticket.ProductItem.Place;
    const seats = this.cartItems
      .filter((item) => item.ProductItem.Place.meta.row.name === place.meta.row.name)
      .reduce((prev, item, i, out) => {
        out[i] = item.ProductItem.Place.meta.seat;
        return out;
      }, []);

    return seats.join(', ');

    // this.firstTicket = {
    //   place: fPlace.meta.fragment.name,
    //   row: fPlace.meta.row.name,
    //   seats: fPlaceSeats.join(', ')
    // };
  }

  getPlaceName(index) {
    return this.cartService.cart_items[index].ProductItem.Place.meta.fragment.name;
  }

  getPlaceRow(index) {
    return this.cartService.cart_items[index].ProductItem.Place.meta.row.name;
  }

  toggleGroup() {
    this.collapse = !this.collapse;
  }

  checkout() {
    this.cartService.checkout({'contacts': this.orderForm.value});
  }

  focusAndTouchForm() {
    this.orderForm._forEachChild(child => {
      // if(!child.valid) console.log('dsd', child);

      child.markAsTouched();
      child.markAsDirty();
    });
    this.focusForm();
  }

  focusForm() {
    this.emailInput.nativeElement.focus();
  }

  onSubmit() {
    this.global.showHideConfirmPopup.next({
      id: 'order-confirm',
      show: 'true',
      values: Object.values(this.orderForm.value)
    });
  }
}
