import {Pipe, PipeTransform} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {GlobalService} from '../../services/global.service';
import {LoggerService} from '../../services/logger.service';

@Pipe({
    name: 'modeofoperation'
})
export class ModeofoperationPipe implements PipeTransform {
    constructor(public translate: TranslateService, public global: GlobalService, private logger: LoggerService) {
    }

    /* Возвращает режим работы на сегодня -- c 10:00 до 17:45 */
    transform(dt: any): string {

        const date = new Date(),
            year = date.getFullYear(),
            month = date.getMonth().toString().length === 1 ? '0' + date.getMonth() : date.getMonth(),
            numbr = date.getDate().toString().length === 1 ? '0' + date.getDate() : date.getDate(),
            dayWeek = date.getDay(),
            text = {
                from: {
                    ru: 'c',
                    en: 'from'
                },
                to: {
                    ru: 'по',
                    en: 'to'
                }
            };
        let startTime = '',
            endTime = '';
/*
        {
            "date" : {
                "2019-12-31":
                {
                    "d": 31,
                    "m": 12,
                    "y": 2019,
                    "end_time": "12:00",
                    "start_time": "00:00"
                }
            },
            "day_of_week": {
                "1": {
                    "n": 1,
                    "end_time": "18:00",
                    "start_time": "11:00"
                }
            },
            "day_of_year": {
                "01-01": {
                    "d": 1,
                    "m": 1,
                    "end_time": "23:00",
                    "start_time": "00:00"
                }
            }
        }
*/
        this.logger.l(dt.day_of_year, numbr + '-' + month);

        //day_of_year
        if(dt.day_of_year[numbr + '-' + month]){
            startTime = dt.day_of_year[numbr + '-' + month].start_time;
            endTime = dt.day_of_year[numbr + '-' + month].end_time;
        }

        this.logger.l(dt.day_of_week, dayWeek);
        //day_of_week
        if(dt.day_of_week[dayWeek]){
            startTime = dt.day_of_week[dayWeek].start_time;
            endTime = dt.day_of_week[dayWeek].end_time;
        }


        this.logger.l(dt.date, year + '-' + month + '-' + numbr);
        // конкретная дата
        if(dt.date[year + '-' + month + '-' + numbr]){
            startTime =dt.date[year + '-' + month + '-' + numbr].start_time;
            endTime = dt.date[year + '-' + month + '-' + numbr].end_time;
        }

        const result = startTime ? text.from[this.translate.currentLang] + ' ' + startTime + ' ' + text.to[this.translate.currentLang] + ' ' + endTime : '';
        return result;
    }
}
