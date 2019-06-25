import {NgModule} from '@angular/core';
import {MandatetimePipe} from './mandatetime.pipe';
import {TranslateModule} from '@ngx-translate/core';
import {CommonModule} from '@angular/common';


@NgModule({
    declarations: [
        MandatetimePipe
    ],
    imports: [
        TranslateModule,
        CommonModule
    ],

    exports: [
        MandatetimePipe
    ],
})

export class MandatetimeModule {}