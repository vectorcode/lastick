import {NgModule} from '@angular/core';
import {DatecustomPipe} from './datecustom.pipe';
import {TranslateModule} from '@ngx-translate/core';
import {CommonModule} from '@angular/common';


@NgModule({
    declarations: [
        DatecustomPipe
    ],
    imports: [
        TranslateModule,
        CommonModule
    ],

    exports: [
        DatecustomPipe
    ],
})

export class DatecustomModule {}