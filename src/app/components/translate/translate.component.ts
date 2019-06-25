import {Component, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {GlobalService} from '../../services/global.service';
import {LoggerService} from '../../services/logger.service';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-translate',
  templateUrl: './translate.component.html'
})
export class TranslateComponent implements OnInit {

  selectedLang: string = this.global.languages[0].val;
  selectedLangStorage: string = localStorage.getItem('language');

  constructor(private translate: TranslateService, public global: GlobalService, private logger: LoggerService,
              private route: ActivatedRoute) {

    this.route.params.subscribe(data => {
      const _lang = data.lang || this.selectedLangStorage || this.global.languages[0].val;
      this.switchLanguage(_lang);
    });
  }

  switchLanguage(language: string) {
    this.selectedLang = language;
    this.translate.setDefaultLang(language);
    this.translate.use(language);
    localStorage.setItem('language', language);
    this.global.langChange.next(true);
    this.logger.l(this.translate);
  }

  ngOnInit() {
  }

}
