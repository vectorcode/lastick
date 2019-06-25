import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {BuyComponent} from './pages/buy/buy.component'
import {GiftComponent} from './pages/gift/gift.component';
import {GiftActivateComponent} from './pages/gift-activate/gift-activate.component';
import {EventsComponent} from './pages/events/events.component';
import {EventTableComponent} from './pages/event-table/event-table.component';
import {EventSchedulesComponent} from './pages/event-schedules/event-schedules.component';
import {EventDescriptionComponent} from './pages/event-description/event-description.component';
import {EventMapComponent} from './pages/event-map/event-map.component';
import {OrderConfirmComponent} from './pages/order-confirm/order-confirm.component';
import {OrderCertStatusComponent} from './pages/order/order.component';
import {OrderFailureComponent} from './pages/order-failure/order-failure.component';
import {LayoutsComponent} from './layouts/layouts.component';
import {OrderConfirmActivateComponent} from './pages/order-confirm-activate/order-confirm-activate.component';
import {OrderStatusComponent} from './pages/order-status/order-status.component';

const routes: Routes = [
    {path: '', component: LayoutsComponent, children:[
        {path: '', component: BuyComponent},
        {path: 'gift', component: GiftComponent},
        {path: 'gift/activate', component: GiftActivateComponent},
        {path: 'events', component: EventsComponent},
        {path: 'events/:event_uuid', component: EventTableComponent, children: []},
        {path: 'events/:event_uuid/schedules', component: EventSchedulesComponent},
        {path: 'events/:event_uuid/description', component: EventDescriptionComponent},
        {path: 'events/:event_uuid/schedules/:schedule_uuid', component: EventMapComponent},
        {path: 'order/confirm', component: OrderConfirmComponent},
        {path: 'order/activate', component: OrderConfirmActivateComponent},
        {path: 'result/:order_uuid/cert/:lang', component: OrderCertStatusComponent},
        // {path: 'order/:order_uuid/fail', component: OrderFailureComponent},
        {path: 'result/:order_uuid/:lang', component: OrderStatusComponent}
      ]},

    // otherwise redirect to home
    {path: '**', redirectTo: ''}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
