import { Injectable } from '@angular/core';
import {environment} from './../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class LoggerService {

    debug: boolean = !environment.production;

    l: any = el => this.debug ? console.log(el) : '';
    e: any = el => this.debug ? console.error(el) : '';
    w: any = el => this.debug ? console.warn(el) : '';
    i: any = el => this.debug ? console.info(el) : '';
}
