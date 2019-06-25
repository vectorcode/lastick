import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {TransportService} from '../../services/transport.service';
import {LoggerService} from '../../services/logger.service';
import {GlobalService} from '../../services/global.service';
import {TranslateService} from '@ngx-translate/core';
import {IEvent} from '../../types/IEvent';
import {IHall} from '../../types/IHall';
import {ILanguages} from '../../types/ILanguages';

@Component({
  selector: 'app-event-schedules',
  templateUrl: './event-schedules.component.html',
  styleUrls: ['./event-schedules.component.less']
})
export class EventSchedulesComponent implements OnInit {
  event_uuid: string;
  eDt: IEvent;
  halls: IHall[] = [];
  viewSchedules: boolean = true;
  media_info: any = null;
  desc: any = this.propIsExist('description') ? this.global.currentEvent.description : null;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private transport: TransportService,
              private logger: LoggerService,
              private global: GlobalService,
              public translate: TranslateService) {
    this.route.params.subscribe(data => {
      this.event_uuid = data.event_uuid;
      //const saveEvent = JSON.parse(sessionStorage.getItem('event'));

      if (!this.global.currentEvent) {
        this.transport.getEvent(this.event_uuid).subscribe(
          s => {
            this.logger.l(s);
            this.global.currentEvent = s;
            this.eDt = this.global.currentEvent;
          },
          e => this.logger.e(e)
        );
      } else {
        this.eDt = this.global.currentEvent;
      }

      this.media_info = this.global.currentEvent.NearestSchedule ? this.global.currentEvent.NearestSchedule.Hall.media_info : null;

      this.logger.l(this.eDt);
      //this.global.currentEvent = JSON.parse(sessionStorage.getItem('event'));

      //this.router.navigate(['']);
    });
  }

  propIsExist(prop) {
    const event = this.global.currentEvent;
    const val = event[prop];

    return val && Object.keys(val).filter(lang => val[lang].trim().length > 0).length > 0;
  }

  ngOnInit() {

    this.transport.getEventsTickets([this.event_uuid]).subscribe(
      success => {
        this.logger.l('Successfully Completed');
        this.logger.l(success);
        this.halls = success;

        this.global.showHideLoader.next(false);
      },
      error => {
        this.logger.l('Error Completed');

        this.global.showHideLoader.next(false);
      }
    );
  }

}
