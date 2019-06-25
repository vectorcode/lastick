import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { LayoutsComponent } from './layouts/layouts.component';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader, TranslateCompiler } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { BuyComponent } from './pages/buy/buy.component';
import { GiftComponent } from './pages/gift/gift.component';
import { GiftActivateComponent } from './pages/gift-activate/gift-activate.component';
import {OrderCertStatusComponent} from './pages/order/order.component';
import { OrderFailureComponent } from './pages/order-failure/order-failure.component';
import { OrderConfirmComponent } from './pages/order-confirm/order-confirm.component';
import { EventsComponent } from './pages/events/events.component';
import { EventDescriptionComponent } from './pages/event-description/event-description.component';
import { EventSchedulesComponent } from './pages/event-schedules/event-schedules.component';
import { EventTableComponent } from './pages/event-table/event-table.component';
import { EventMapComponent } from './pages/event-map/event-map.component';
import { LoaderComponent } from './components/loader/loader.component';
import { TranslateComponent } from './components/translate/translate.component';
import { GlobalService } from './services/global.service';
import { InfoService } from './services/info.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { httpInterceptorProviders } from './http-interceptors/index';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { ControlMessagesComponent } from './components/control-messages/control-messages.component';
import { InfiniteScrollComponent } from './components/infinite-scroll/infinite-scroll.component';
import { CartService } from './services/cart.service';
import { HallSchemaModule } from './components/hall_schema/hall_schema.module';
import { ButtonCartComponent } from './components/button-cart/button-cart.component';
import { OrderConfirmActivateComponent } from './pages/order-confirm-activate/order-confirm-activate.component';
import { DeviceDetectorModule } from 'ngx-device-detector';
import { TranslateMessageFormatCompiler, MESSAGE_FORMAT_CONFIG } from 'ngx-translate-messageformat-compiler';
import {LangModule} from './pipes/multilang/lang.module';
import {MandatetimeModule} from './pipes/mandatetime/mandatetime.module';
import {DatecustomModule} from './pipes/datecustom/datecustom.module';
import {DurationModule} from './pipes/duration/duration.module';
import {ModeofoperationModule} from './pipes/modeofoperation/modeofoperation.module';
import {MoneyModule} from './pipes/money/money.module';
import {NumerativeModule} from './pipes/numerative/numerative.module';
import { InfoComponent } from './components/info/info.component';
import {OrderStatusComponent} from './pages/order-status/order-status.component';
import {DragScrollModule} from 'ngx-drag-scroll/lib';
import { ConfirmPopupComponent } from './components/confirm-popup/confirm-popup.component';
// import { BlurComponent } from './components/blur/blur.component';


export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/');
}

@NgModule({
  declarations: [
    AppComponent,
    LayoutsComponent,
    BuyComponent,
    GiftComponent,
    GiftActivateComponent,
    OrderFailureComponent,
    OrderConfirmComponent,
    EventsComponent,
    EventDescriptionComponent,
    EventSchedulesComponent,
    EventTableComponent,
    EventMapComponent,
    LoaderComponent,
    TranslateComponent,
    HeaderComponent,
    FooterComponent,
    ControlMessagesComponent,
    InfiniteScrollComponent,
    ButtonCartComponent,
    OrderConfirmActivateComponent,
    InfoComponent,
    OrderCertStatusComponent,
    OrderStatusComponent,
    ConfirmPopupComponent
    // BlurComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    NgSelectModule,
    FormsModule,
    HallSchemaModule,
    LangModule,
    MandatetimeModule,
    DatecustomModule,
    DurationModule,
    ModeofoperationModule,
    MoneyModule,
    NumerativeModule,
    DragScrollModule,
    DeviceDetectorModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
      },
      compiler: {
        provide: TranslateCompiler,
        useClass: TranslateMessageFormatCompiler
      }
    })
  ],
  providers: [
      GlobalService,
      InfoService,
      httpInterceptorProviders,
      TranslateComponent,
      CartService,
      {
        provide: MESSAGE_FORMAT_CONFIG,
        useValue: {
          locales: ['ru', 'en'],
          biDiSupport: true
        }
      }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
