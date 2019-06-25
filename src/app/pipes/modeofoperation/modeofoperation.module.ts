import {NgModule} from '@angular/core';
import {ModeofoperationPipe} from './modeofoperation.pipe';
import {TranslateModule} from '@ngx-translate/core';
import {CommonModule} from '@angular/common';


@NgModule({
    declarations: [
        ModeofoperationPipe
    ],
    imports: [
        TranslateModule,
        CommonModule
    ],

    exports: [
        ModeofoperationPipe
    ],
})

export class ModeofoperationModule {}