import {NgModule} from '@angular/core';
import {HallSchemaContainerComponent} from './hall_schema_container.component';
import {HallSchemaComponent} from './hall_schema.component';
import {HallSchemaPopupComponent} from './popup/popup.component';
import {TranslateModule} from '@ngx-translate/core';
import {HallSchemaControlsComponent} from './controls/controls.component';
import {HallSchemaSidebarComponent} from './sidebar/sidebar.component';
import {HallSchemaSeatinfoComponent} from './seatinfo/seatinfo.component';
import {CommonModule} from '@angular/common';
import {PerfectScrollbarModule, PerfectScrollbarConfigInterface, PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import {HallSchemaLegendComponent} from './legend/legend.component';
import {LangModule} from '../../pipes/multilang/lang.module';
import {MoneyPipe} from '../../pipes/money/money.pipe';
import {MoneyModule} from '../../pipes/money/money.module';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  wheelPropagation: true,
  swipeEasing: true,
};

@NgModule({
  declarations: [
    HallSchemaContainerComponent,
    HallSchemaComponent,
    HallSchemaPopupComponent,
    HallSchemaControlsComponent,
    HallSchemaSidebarComponent,
    HallSchemaSeatinfoComponent,
    HallSchemaLegendComponent
  ],
  imports: [
    TranslateModule,
    CommonModule,
    PerfectScrollbarModule,
    LangModule,
    MoneyModule
  ],

  exports: [
    HallSchemaContainerComponent
  ],
  providers: [
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    }
  ]
})

export class HallSchemaModule {}
