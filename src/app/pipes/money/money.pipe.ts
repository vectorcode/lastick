import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { GlobalService } from '../../services/global.service';

@Pipe({
    name: 'money'
})
export class MoneyPipe implements PipeTransform {
    constructor(public translate: TranslateService, public global: GlobalService){}
    /* Возвращает стоимость -- 100.00 */
    transform(dt: any): number {

        const result = dt / 100;
        return result;
    }
}
