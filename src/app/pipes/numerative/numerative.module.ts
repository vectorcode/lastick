import {NgModule} from '@angular/core';
import {NumerativePipe} from './numerative.pipe';
import {TranslateModule} from '@ngx-translate/core';
import {CommonModule} from '@angular/common';


@NgModule({
    declarations: [
        NumerativePipe
    ],
    imports: [
        TranslateModule,
        CommonModule
    ],

    exports: [
        NumerativePipe
    ],
})

export class NumerativeModule {}