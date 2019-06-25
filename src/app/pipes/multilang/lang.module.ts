import {NgModule} from '@angular/core';
import {MultilangFieldPipe} from './multilang_field.pipe';
import {TranslateModule} from '@ngx-translate/core';
import {CommonModule} from '@angular/common';


@NgModule({
  declarations: [
    MultilangFieldPipe
  ],
  imports: [
    TranslateModule,
    CommonModule
  ],

  exports: [
    MultilangFieldPipe
  ],
})

export class LangModule {}
