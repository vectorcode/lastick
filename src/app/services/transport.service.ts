import {Injectable, OnInit} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {GlobalService} from '../services/global.service';
import {SecureApiService} from './secure-api.service';
import {IPaymentMethod} from '../types/Entities';

@Injectable({
  providedIn: 'root'
})

export class TransportService {

  private headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
  private headersJson = new HttpHeaders().set('Content-Type', 'application/json');


  constructor(private httpClient: HttpClient, private secureApi: SecureApiService, private global: GlobalService) {
    // this.httpClient.get(this.serverCertificateUrl+'settings', { headers: this.headers }).
    // subscribe(response => console.log(response));
  }

  /* Gift Activate Page */
  public certificateValidation(uuid): Observable<any> {
    return this.httpClient.post(
      this.global.serverUrl + 'certificate/' + uuid + '/validation', {}
    );
  }

  public certificateActivate(id): Observable<any> {
    //http://le.lastick.xd.unitix.cloud/widget/v1/certificate/activate
    //{"number": TBH104193}
    return this.secureApi.apiRunner('POST', 'certificate/activate', {number: id});
  }


  /* Gift Page */
  public showcaseList(): Observable<any> {
    return this.httpClient.get(
      this.global.serverUrl + 'showcase/list', {headers: this.headers}
    );
  }

  /* Order Page */
  public showcaseOrder(uuid): Observable<any> {
    return this.httpClient.get(
      this.global.serverUrl + 'showcase/order/' + uuid, {headers: this.headers}
    );
  }

  /* Order Confirm Page */
  public showcasePaymentMethod(): Observable<any> {
    return this.httpClient.get(
      this.global.serverUrl + 'showcase/payment_method', {headers: this.headers}
    );
  }

  public newOrder(dt): Observable<any> {
    return this.httpClient.put(
      this.global.serverUrl + 'showcase/cart', dt, {headers: this.headers}
    );
  }

  /* Events Page */
  public getEvents(page, conditions, count): Observable<any> {
    //conditions, page, count
    return this.secureApi.apiRunner('GET', `nearest_events?page=${page}&conditions=${JSON.stringify(conditions)}&count=${count}`);
  }

  /* Event page */
  public getEvent(uuid: string): Observable<any> {
    return this.secureApi.apiRunner('GET', `events/${uuid}`);
  }

  /* Event Shedules page */
  public getTickets(uuid: string): Observable<any> {
    return this.secureApi.apiRunner('GET', `schedule/${uuid}/tickets`);
  }

  public getEventsTickets(aUuid: string[]): Observable<any> {
    // http://le.lastick.xd.unitix.cloud/widget/v1/schedules?events=["9883668d-e74f-4424-877f-e1cfda7797b4"]
    return this.secureApi.apiRunner('GET', `schedules?events=["${aUuid}"]`);
  }


  /* Geometry data */
  public getGeometry(uuid: string): Observable<any> {
    return this.secureApi.apiRunner('GET', `geometry/${uuid}`);
  }

  public getSchedule(uuid: string): Observable<any> {
    return this.secureApi.apiRunner('GET', `schedule/${uuid}`);
  }

  public getSchedules(event_uuid: string): Observable<any> {
    return this.secureApi.apiRunner('GET', `schedules?events=${JSON.stringify([event_uuid])}`);
  }


  /* Cart work */
  public getCart(): Observable<any> {
    return this.secureApi.apiRunner('GET', 'cart');
  }

  public addItemCart(itemUuid: string, priceUuid: string): Observable<any> {
    return this.secureApi.apiRunner('PUT', 'cart',
      {
        item_uuid: itemUuid,
        price_uuid: priceUuid
      });
  }

  public dellItemCart(uuid: string): Observable<any> {
    return this.secureApi.apiRunner('DELETE', `cart/${uuid}`);
  }

  public clearCart(): Observable<any> {
    return this.secureApi.apiRunner('DELETE', `cart`);
  }

  ///cart/payment_method
  public getCartPaymentMethod(): Observable<any> {
    return this.secureApi.apiRunner('GET', 'cart/payment_method');
  }

  public setCartPaymentMethod(body: any): Observable<any> {
    return this.secureApi.apiRunner('POST', 'cart/payment_method', body);
  }


  public newCartOrder(data): Observable<any> {
    return this.secureApi.apiRunner('POST', 'cart/order', data);
  }

  public getOrder(uuid: string): Observable<any> {
    return this.secureApi.apiRunner('GET', `order/${uuid}`);
  }
}
