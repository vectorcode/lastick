import {Injectable} from '@angular/core';
import {HttpInterceptor, HttpRequest, HttpHandler, HttpResponse, HttpEvent} from '@angular/common/http';
import {GlobalService} from '../services/global.service';
import {InfoService} from '../services/info.service';
import {SecureApiService} from '../services/secure-api.service';
import {Observable} from 'rxjs/index';
import {finalize, tap, map} from 'rxjs/internal/operators';
import {environment} from '../../environments/environment';
import {TranslateService} from '@ngx-translate/core';

@Injectable()
export class LoggingInterceptor implements HttpInterceptor {
  constructor(private global: GlobalService,
              private secureApi: SecureApiService,
              private info: InfoService,
              private translate: TranslateService) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const startTime = Date.now();
    const token = localStorage.getItem('x-auth-token');

    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
    /*else {
               const xmlHttp = new XMLHttpRequest();
               xmlHttp.open( "GET", this.global.serverCertificateUrl+'settings', false );
               xmlHttp.send( null );
               localStorage.setItem('auth_token', xmlHttp.getResponseHeader('x-auth-token'));
           }
   */
    /*
            if (!this.global.settings){
                const xmlHttp = new XMLHttpRequest();
                xmlHttp.open( "GET", this.global.serverCertificateUrl+'settings', false );
                xmlHttp.send( null );

                if(xmlHttp.status === 200){
                    this.global.settings = JSON.parse(xmlHttp.response);
                }
                console.warn(JSON.parse(xmlHttp.response));
            }
    */
    /*if (!this.global.settings){
        const getSettings = this.secureApi.getSettings();
        getSettings.subscribe(success => {
            console.warn(success);
            this.global.settings = success;
        },
            fail => {
                console.warn(fail);
        });
    }*/


    return next.handle(request).pipe(map(event => {

        /*if (event instanceof HttpResponse) {
            console.warn(event.headers.get('x-auth-token'));
                localStorage.setItem('auth_token', event.headers.get('x-auth-token'))
            }
            */
        return event;
      })
    ).pipe(
      tap(
        event => {

          status = '';
          if (event instanceof HttpResponse) {
            status = 'succeeded';
          }
        },
        serverError => {
          status = 'failed';
          debugger;
          this.translate.get('ERRORS').toPromise().then((err) => {
            const { message } = serverError.error;
            const value = (typeof message !== 'string' || !err || !err[message]) ? "Something went wrong" : err[message]();

            this.info.showError(value);
          });
        }
      ),
      finalize(() => {
        const elapsedTime = Date.now() - startTime;
        const message = request.method + ' ' + request.urlWithParams + ' ' + status
          + ' in ' + elapsedTime + 'ms';

        this.logDetails(message);
      })
    );
  }

  private logDetails(msg: string) {
    if (!environment.production) {
      console.log(msg);
    }
  }
}
