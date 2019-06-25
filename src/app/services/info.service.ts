import {Injectable} from '@angular/core';
import {GlobalService} from '../services/global.service';

@Injectable({
    providedIn: 'root'
})

export class InfoService {
    constructor(private global: GlobalService) {
    }

    public showInfo(message:string, time:number = 3000) {
        this.global.showHideInfo.next({
            type: '',
            msg: message,
            timer: time
        });
    }

    public showError(message:string, time:number = 3000) {
        this.global.showHideInfo.next({
            type: 'error',
            msg: message,
            timer: time
        });
    }

    public showSuccess(message:string, time:number = 3000) {
        this.global.showHideInfo.next({
            type: 'success',
            msg: message,
            timer: time
        });
    }

}
