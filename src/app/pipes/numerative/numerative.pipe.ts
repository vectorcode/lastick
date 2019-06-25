import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'numerative'
})
export class NumerativePipe implements PipeTransform {
    transform(value: number, titles: any, args?: any): string {
        if (value <= 0 || !titles.length) { return ''; }
        const cases = [2, 0, 1, 1, 1, 2];
        return titles[(value % 100 > 4 && value % 100 < 20) ? 2 : cases[(value % 10 < 5 ) ? value % 10 : 5]];
    }
}
