import { Injectable, OnInit} from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GlobalService } from '../services/global.service';
import {HttpObserve} from '@angular/common/http/src/client';
import {fromPromise} from 'rxjs/internal-compatibility';
import {filter, map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class SecureApiService implements OnInit {

  private auth_token: string;

  constructor(private global: GlobalService, private http: HttpClient) {

  }

  ngOnInit(){

  }

  private save_token(token: string) {
    this.auth_token = token;
    try {
      localStorage.setItem('x-auth-token', token);
    } catch (e) {
      console.error("localstorage unavailable");
    }
  }

  private get_token() {
    try {
      this.auth_token = localStorage.getItem('x-auth-token');
      return this.auth_token
    } catch (e) {
      console.error("localstorage unavailable");
    }
  }

  public apiRunner(method: 'GET' | 'POST' | 'PUT' | 'DELETE', uri: string, body?: object ): Observable<HttpResponse<any>> {
    let httpHeaders = new HttpHeaders();

    if(body) {
      httpHeaders = httpHeaders.append('content-type', 'application/json');
    }

    const httpParams = new HttpParams();
    httpParams.append('observe', 'response');


    const httpRequest = new HttpRequest(
      method,
      this.global.serverCertificateUrl + uri,
      httpHeaders,
    );

    const options = {
      responseType: 'json' as 'json',
      headers: httpHeaders,
      observe: 'response' as HttpObserve
    };
    if(body) {
      options['body'] = body;
    }

    if(!!this.global.settings) {
      if(this.get_token()) {
        httpHeaders = httpHeaders.append('authorization', `Bearer ${this.get_token()}`);
      }
      options.headers = httpHeaders;
      return this.http.request(method, this.global.serverCertificateUrl + uri, options)
        .pipe(filter(e => e instanceof HttpResponse ))
        .pipe(
          map(e => {
            this.save_token(e.headers.get('x-auth-token'));
            return e.body;
          })
      );
    } else {
      return fromPromise(
        this.getSettings()
          .toPromise()
          .then(d => {
            this.save_token(d.headers.get('x-auth-token'));
            if(this.get_token()) {
              httpHeaders = httpHeaders.append('authorization', `Bearer ${this.get_token()}`);
            }
            this.global.setSettings(d.body);
            options.headers = httpHeaders;
            return this.http.request(method, this.global.serverCertificateUrl + uri, options).toPromise()
              .then(d => {
                this.save_token(d.headers.get('x-auth-token'));
                return d.body;
              });
          })
      );
    }
  }

  public getSettings(): Observable<HttpResponse<any>> {

    return this.http.get(this.global.serverCertificateUrl + 'settings', {observe: 'response'});
  }

}
