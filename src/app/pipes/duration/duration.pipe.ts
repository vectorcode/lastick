import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { GlobalService } from '../../services/global.service';

@Pipe({
    name: 'duration'
})
export class DurationPipe implements PipeTransform {
    constructor(public translate: TranslateService, public global: GlobalService){}
    /* Возвращает длительность --1 ЧАС 45 МИНУТ */
    transform(dt: any): string {
        const hours = dt.hours ? `${dt.hours} ${this.global.hours[this.translate.currentLang].name}` : '';
        const minutes = dt.minutes ? `${dt.minutes} ${this.global.minutes[this.translate.currentLang].name}` : '';
        const time = `${hours} ${minutes}`;
        const result = (hours.length === 0 || minutes.length === 0) ? time.replace(/\s/g, '') : time;

        return result;
    }
}
