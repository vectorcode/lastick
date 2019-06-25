import {Injectable, OnDestroy, OnInit} from '@angular/core';
import {
  ICartItem,
  ICertificate,
  IPromocode,
  ICartData,
  IPaymentMethod,
  IPriceValue,
  IProductItem,
  IContacts,
  IProductTicket, IServerCartItem
} from '../types/Entities';
import {ICartResponse} from '../types/Responses';
import {TransportService} from './transport.service';
import {Observable, pipe, Subject, of, Observer, ReplaySubject, BehaviorSubject} from 'rxjs';
import {switchMap, catchError, debounce, debounceTime} from 'rxjs/operators';
import {pathOr, isNil} from 'ramda';
import {reject} from 'q';
import {LoggerService} from './logger.service';
import {InfoService} from './info.service';
import {ActivatedRoute, NavigationEnd, Route, Router} from '@angular/router';

import * as PQueue from 'p-queue';

@Injectable()
export class CartService implements OnInit {

  private cart_items_storage: {
    [product_item_uuid_underscore_price_value_uuid: string]: ICartItem
  } = {};

  private cart_items_order: string[] = [];

  public items: ICartItem;
  public certificate: any;
  public promocodes: IPromocode[];
  public payment_method: IPaymentMethod;
  public payment_methods: IPaymentMethod[];
  public total_cost: number;
  public total_items: number;
  public service_fee: number;
  private serverCart: any = {};
  private currentUrl: string;
  private initClearCart = false;
  private eventMapPage: RegExp = /\/events\/.+\/schedules\/.+/;
  private orderActivatePage: RegExp = /\/order\/activate/;

  private cartOutputSource = new ReplaySubject<ICartData>(0);
  cartOutput$ = this.cartOutputSource.asObservable();

  private cartRecalcSource = new Subject<void>();
  private cartRecalc$ = this.cartRecalcSource.asObservable().pipe(debounceTime(100));
  private removeFromCartSource = new Subject<ICartItem>();
  public removeFromCart$ = this.removeFromCartSource.asObservable();

  constructor(
    private transport: TransportService,
    private logger: LoggerService,
    private info: InfoService,
    private route: ActivatedRoute,
    private router: Router) {

    console.log('CART CONSTRUCTOR');
    this.cartRecalc$.subscribe(() => {
      this.calculate();
      this.emitCartChanges();
    });
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentUrl = event.url;
        this.clearCartOnPage();
      }
    });

    this.cartOutputSource.subscribe(() => {
      this.clearCartOnPage();
    });


    this.cartRecalcSource.next();

  }

  ngOnInit() {

  }

  public get cart_items(): ICartItem[] {
    return this.cart_items_order.map((el) => this.cart_items_storage[el]);
  }

  public dropCart() {
    this.cart_items_storage = {};
    this.cart_items_order = [];
  }

  private getStorageKey(item: IProductItem, price: IPriceValue): string {
    return `${item.uuid}_${price.uuid}`;
  }

  public addItem(item: IProductItem, price: IPriceValue) {
    const key = this.getStorageKey(item, price);
    let cartItem: ICartItem;
    if (this.cart_items_storage.hasOwnProperty(key)) {
      cartItem = this.cart_items_storage[key];
      cartItem.quantity += 1;
      cartItem.total_cost = cartItem.quantity * cartItem.PriceValue.amount * 100;
    } else {
      cartItem = {
        PriceValue: price,
        ProductItem: item,
        PriceModifiers: undefined,
        quantity: 1,
        uuid: '',
        total_cost: price.amount * 100,
        service_fee: 0
      };
      this.cart_items_order.push(key);
      this.cart_items_storage[key] = cartItem;
    }
    this.cartRecalcSource.next();
  }

  public removeItem(item: IProductItem, price?: IPriceValue) {
    console.log('REMOVE_ITEM', item, price);
    if (isNil(price)) {
      const existsKeys = Object.keys(this.cart_items_storage).filter((el) => el.split('_')[0] === item.uuid);
      existsKeys.forEach((el) => {
        const citem = this.cart_items_storage[el];
        this.removeFromCartSource.next(citem);
        delete this.cart_items_storage[el];
      });
      existsKeys.forEach((k) => {
        this.cart_items_order = this.cart_items_order.filter((el) => el !== k);
      });
    } else {
      const key = this.getStorageKey(item, price);
      if (this.cart_items_storage[key].quantity <= 1) {
        const citem = this.cart_items_storage[key];
        this.removeFromCartSource.next(citem);
        delete this.cart_items_storage[key];
        this.cart_items_order = this.cart_items_order.filter((el) => el !== key);
      }
    }

    this.cartRecalcSource.next();
  }

  private clearCartOnPage() {
    const isCartPage = this.currentUrl.match(this.eventMapPage) || this.currentUrl.match(this.orderActivatePage);

    if ((this.cart_items && this.cart_items.length) && !isCartPage && !this.initClearCart) {
      this.initClearCart = true;
      this.transport.clearCart().toPromise().then((data) => {
        // this.reloadCart();
        this.cart_items_storage = {};
        this.cart_items_order = [];
        this.initClearCart = false;
        this.emitCartChanges();
      });
    }
  }

  public syncCart() {
    this.loadServerCart().then((serverCart: any) => {
      const sCartItemsHash = serverCart.cart_items.reduce((acc, el) => {
        const k = `${el.product_item}_${el.price_value_uuid}`;
        if (acc.hasOwnProperty(k)) {
          acc[k].quantity += 1;
        } else {
          acc[k] = {
            scitem: el,
            item: el.ProductItem,
            quantity: 1,
            price: el.PriceValue
          };
        }
        return acc;
      }, {})
      let toAdd = [];
      let toRemove = [];

      Object.keys(sCartItemsHash).forEach((k) => {
        const serverItem = sCartItemsHash[k] as any;
        if (this.cart_items_storage.hasOwnProperty(k)) {
          const innerItem = this.cart_items_storage[k];
          if (innerItem.quantity > serverItem.quantity) {
            toAdd = toAdd.concat(
              Array<{item: any, price: any}>(innerItem.quantity - serverItem.quantity)
                .fill({item: innerItem.ProductItem, price: innerItem.PriceValue})
            );
          } else if(serverItem.quantity > innerItem.quantity) {
            toRemove = toRemove.concat(
                Array<IServerCartItem>(serverItem.quantity - innerItem.quantity)
                  .fill(serverItem.scitem)
            );
          }
        } else {
          toRemove = toRemove.concat(serverItem.scitem);
        }
      });
      Object.keys(this.cart_items_storage).forEach((k) => {
        const innerItem = this.cart_items_storage[k];
        if (!sCartItemsHash.hasOwnProperty(k)) {
          toAdd = toAdd.concat(
            Array<{item: any, price: any}>(innerItem.quantity)
              .fill({item: innerItem.ProductItem, price: innerItem.PriceValue})
          );
        }
      });

      console.log("DIFF TO ADD", toAdd);
      console.log("DIFF TO REMOVE", toRemove);
      console.log('SYNC QUEUE START');
      const responses = [];
      const queue = new PQueue({concurrency: 1});
      toAdd.forEach((el) => {
        queue.add(() => {
          this.transport.addItemCart(el.item.uuid, el.price.uuid).toPromise()
            .then((e) => Promise.resolve({state: 'ok', op: 'add', in: el, out: e}))
            .catch((e) => Promise.resolve({state: 'error', op: 'add', in: el, out: e}));
        }).then((data) => responses.push(data));
      });

      toRemove.forEach((el) => {
        queue.add(() => {
          this.transport.dellItemCart(el.uuid).toPromise()
            .then((e) => Promise.resolve({state: 'ok', op: 'remove', in: el, out: e}))
            .catch((e) => Promise.resolve({state: 'error', op: 'remove', in: el, out: e}));
        }).then((data) => responses.push(data));
      });
      queue.onIdle(() => {
        console.log('SYNC QUEUE DONE');
        console.log('QUEUE RESPONSES', responses);
      });
    });
  }



  public setCartPaymentMethod(method: any) {
    this.transport.setCartPaymentMethod(method).subscribe((e) => {
      this.payment_method = e;
    });
  }

  private calculate() {
    this.total_items = 0;
    this.total_cost = 0;
    this.service_fee = 0;
    Object.values(this.cart_items_storage).forEach((item) => {
      this.total_items += item.quantity;
      this.total_cost += item.total_cost;
      this.service_fee += item.service_fee;
      console.log(item);
    });

  }


  private loadServerCart(): Promise<any> {
    return this.transport.getCart().toPromise()
        .then((e: any) => {
          const serverCart = this.serverCart;
          serverCart.cart_items = e.items;
          serverCart.promocodes = e.promocodes;
          serverCart.certificate = e.certificate;
          serverCart.total_cost = e.total_cost;
          serverCart.total_items = this.cart_items.length;
          serverCart.payment_method = e.payment_method;
          serverCart.service_fee = e.service_fee;
          this.certificate = e.certificate;
          return serverCart;
        });
  }


  public reloadCart() {
    console.log('start reload');
    this.getAllowedPaymentMethods().subscribe((methods: IPaymentMethod[]) => {
      this.payment_methods = methods;

      if (methods && methods.length && !this.payment_method) {
        this.setCartPaymentMethod({'payment_method': this.payment_methods[0].uuid});
      }
    });
    this.loadServerCart();

  }

  private moveToPay(url) {
    document.location.href = url;
  }

  public emitCartChanges() {
    console.log('emit cart changes');

    this.cartOutputSource.next({
      items: this.cart_items_order.map((el) => this.cart_items_storage[el]),
      certificate: this.certificate,
      total_cost: this.total_cost,
      total_items: this.total_items,
      payment_method: this.payment_method,
      service_fee: this.service_fee
    });
  }

  public getAllowedPaymentMethods(): Observable<any> {
    if (this.certificate && !this.certificate['allow_overpayment']) {
      return of([]);
    }

    return this.transport.getCartPaymentMethod();
  }

  public checkout(data: IContacts) {
    this.logger.w('checkout -->');
    this.logger.l(data);
    this.transport.newCartOrder(data)
      .toPromise()
      .then((success) => {
        this.logger.l('newCartOrder -->');
        this.logger.l(success);
        // this.cartCheckoutSource.next(success);
        this.moveToPay(success.payment.redirect.value);
      })
      .catch((error) => {
        this.logger.w(error);
      });
  }

  public getCartPaymentMethod(): Observable<any> {
    return this.transport.getCartPaymentMethod();
  }
}
