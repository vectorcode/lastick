import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { GlobalService } from '../../services/global.service';

@Pipe({
    name: 'mandatetime'
})
export class MandatetimePipe implements PipeTransform {
    constructor(public translate: TranslateService, public global: GlobalService){}
    /* Возвращает дату в формате -- 9 июня, пятница, 19:00 */
    transform(dt: string): string {
        const date = new Date(dt);

        if(isNaN(date.getTime())) return;

        const day = this.global.days[date.getDay()][this.translate.currentLang].name;
        const month = this.global.month[date.getMonth()][this.translate.currentLang].name;
        const numbr = date.getDate();
        const time = date.getHours() + ':' + (date.getMinutes().toString().length === 1 ? '0' + date.getMinutes() : date.getMinutes());
        const result = numbr + ' ' + month + ', ' + day + ', ' + time;

        return result;
    }
}
