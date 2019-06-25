import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { propOr, is } from 'ramda';

@Pipe({
  name: 'multilang'
})
export class MultilangFieldPipe implements PipeTransform {
  constructor(public translate: TranslateService){}

  transform(k: any): string {
    const lang = this.translate.currentLang;
    if (is(Object, k)) {
      return propOr(k['ru'], lang, k);
    } else {
      return k;
    }
  }
}
