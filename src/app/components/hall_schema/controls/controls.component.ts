import {Component, Input, OnChanges, OnInit, ViewEncapsulation} from '@angular/core';
import {Subject} from 'rxjs';


@Component({
  selector: 'app-hall-schema-controls',
  template: `
  <div class="zoom-block">
    <div class="control-button plus" (click)="zoomIncrease($event)"></div>
    <div class="control-button minus" (click)="zoomDecrease($event)"></div>
  </div>
  <div>
    <div class="control-button info" (click)="info($event)"></div>
  </div>
  `,
  styleUrls: ['./controls.component.less']
})

export class HallSchemaControlsComponent implements OnInit {

  @Input('zoomSubject') zoomSubjectSource: Subject<number>;
  @Input('infoSubject') infoSubjectSource: Subject<any>;

  constructor() {

  }

  public ngOnInit() {

  }

  public zoomIncrease(ev) {
    ev.stopPropagation();
    ev.preventDefault();
    if(this.zoomSubjectSource) {
      this.zoomSubjectSource.next(1);
    }
  }

  public zoomDecrease(ev) {
    ev.stopPropagation();
    ev.preventDefault();
    if(this.zoomSubjectSource) {
      this.zoomSubjectSource.next(-1);
    }
  }

  public info(ev) {
    if(this.infoSubjectSource) {
      this.infoSubjectSource.next('info');
    }
  }
}
