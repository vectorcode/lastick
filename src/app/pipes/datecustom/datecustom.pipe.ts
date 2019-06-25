import {Pipe, PipeTransform} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {GlobalService} from '../../services/global.service';
import {format} from 'date-fns';

@Pipe({
  name: 'datecustom'
})
export class DatecustomPipe implements PipeTransform {
  constructor(public translate: TranslateService, public global: GlobalService) {
  }

  /* Возвращает дату в формате -- 9.09.2018 */
  transform(dt: string): string {
    console.log('original', dt);
    // необходимый формат для сафари 'yyyy-MM-ddTH:mm:ssZZZZZ' (2019-02-01T00:00:00+03:00)
    dt = dt.replace(/\s/, 'T').replace(/(\+\d+)/, '$1:00');
    console.log('to format', dt);
    console.log('result', format(dt, 'D.MM.YYYY'));
    return format(dt, 'D.MM.YYYY');
  }
}
