import {Injectable} from '@angular/core';
import {ILanguages} from '../types/ILanguages';
import {IInfoPopup} from '../types/IInfoPopup';
import {IOrder} from '../types/IOrder';
import {ISertificate} from '../types/ISertificate';
import {IOffers} from '../types/IOffers';
import {ReplaySubject, BehaviorSubject, Subject} from 'rxjs';
import {IEvent} from '../types/IEvent';
import {ICart} from '../types/ICart';
import {ICartItem} from '../types/Entities';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {
  public showHideLoader = new ReplaySubject<boolean>(0);
  public showHideInfo = new ReplaySubject<IInfoPopup>(0);
  public showHideConfirmPopup = new Subject<any>();
  public mapInfo = new ReplaySubject<any>(0);
  public blur = new ReplaySubject<any>(0);
  public langChange = new BehaviorSubject<boolean>(true);

  public settings: any = false;

  public serverUrl = '/api/gift/v1/';
  public serverCertificateUrl = '/api/widget/v1/';
  public imgUrl = 'https://media.lastick.xd.unitix.cloud';
  public bgImgSchedulesPage = 'url(https://res.cloudinary.com/opera-national-de-paris/image/upload/c_crop%2Ch_653%2Cw_1155%2Cx_0%2Cy_0/c_fit%2Ch_435%2Cw_770/f_auto/v1/user_photos/rm85pyyemvjftbml9sin)';

  public languages: ILanguages[] = [
    {val: 'ru', name: 'RU'},
    {val: 'en', name: 'EN'}
  ];

  // public activeSertificate: ISertificate;
  public currentEvent: IEvent;
  public cart: ICart;


  public logoImage = 'assets/img/mariinsky-logo@2x.png';
  public certificate = '003646e4-cdb4-41a4-9348-12761835aa0e';
  public certificateView = '003646e4-cdb3-43c5-96aa-ce2e8c47d561';
  public serviceMoney = 120;

  public specOffers: IOffers[] = [
    {code: 'binoculars', name: {en: 'Аренда бинокля', ru: 'Аренда бинокля'}, price: 300, count: 0},
    {code: 'entry', name: {en: 'VIP вход в зал', ru: 'VIP вход в зал'}, price: 300, count: 0},
    {code: 'wineglass', name: {en: '2 бокала Moet Chandon', ru: '2 бокала Moet Chandon'}, price: 300, count: 0}
  ];

  public orderGlobal: any = new ReplaySubject<IOrder>(0);

  private settingsSource = new Subject<any>();

  settings$ = this.settingsSource.asObservable();

  public days = [
    {ru: {name: 'Воскресенье'}, en: {name: 'Sunday'}},
    {ru: {name: 'Понедельник'}, en: {name: 'Monday'}},
    {ru: {name: 'Вторник'}, en: {name: 'Tuesday'}},
    {ru: {name: 'Среда'}, en: {name: 'Wednesday'}},
    {ru: {name: 'Четверг'}, en: {name: 'Thursday'}},
    {ru: {name: 'Пятница'}, en: {name: 'Friday'}},
    {ru: {name: 'Суббота'}, en: {name: 'Saturday'}}
  ];

  public month = [
    {ru: {name: 'Января'}, en: {name: 'January'}},
    {ru: {name: 'Февраля'}, en: {name: 'February'}},
    {ru: {name: 'Марта'}, en: {name: 'March'}},
    {ru: {name: 'Апреля'}, en: {name: 'April'}},
    {ru: {name: 'Майя'}, en: {name: 'March'}},
    {ru: {name: 'Июня'}, en: {name: 'June'}},
    {ru: {name: 'Июля'}, en: {name: 'July'}},
    {ru: {name: 'Августа'}, en: {name: 'August'}},
    {ru: {name: 'Сентября'}, en: {name: 'September'}},
    {ru: {name: 'Октября'}, en: {name: 'October'}},
    {ru: {name: 'Ноября'}, en: {name: 'November'}},
    {ru: {name: 'Декабря'}, en: {name: 'December'}}
  ];

  public hours = {ru: {name: 'час(а)'}, en: {name: 'hours'}};
  public minutes = {ru: {name: 'минут'}, en: {name: 'minutes'}};

  constructor() {
    this.settings$.subscribe(settings => {
      console.log('APPLY SETTINGS');
      this.settings = settings;
    });
  }

  public setSettings(settings: any) {
    this.settingsSource.next(settings);
  }


}
