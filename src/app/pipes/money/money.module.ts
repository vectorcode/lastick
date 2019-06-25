import {NgModule} from '@angular/core';
import {MoneyPipe} from './money.pipe';
import {TranslateModule} from '@ngx-translate/core';
import {CommonModule} from '@angular/common';


@NgModule({
    declarations: [
        MoneyPipe
    ],
    imports: [
        TranslateModule,
        CommonModule
    ],

    exports: [
        MoneyPipe
    ],
})

export class MoneyModule {}