import {NgModule} from '@angular/core';
import {DurationPipe} from './duration.pipe';
import {TranslateModule} from '@ngx-translate/core';
import {CommonModule} from '@angular/common';


@NgModule({
    declarations: [
        DurationPipe
    ],
    imports: [
        TranslateModule,
        CommonModule
    ],

    exports: [
        DurationPipe
    ],
})

export class DurationModule {}