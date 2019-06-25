import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {GlobalService} from '../../services/global.service';
import {s, st} from '@angular/core/src/render3';

@Component({
  selector: 'app-confirm-popup',
  templateUrl: './confirm-popup.component.html',
  styleUrls: ['./confirm-popup.component.less']
})
export class ConfirmPopupComponent implements OnInit {
  @Input('text') text: string;
  // @Input('values') values: Array<string>;
  @Input('id') id: string;

  @Output('onSuccess') onSuccessEmitter: EventEmitter<any> = new EventEmitter();
  @Output('onCancel') onCancelEmitter: EventEmitter<any> = new EventEmitter();

  show = false;
  values: Array<string>;

  constructor(private global: GlobalService) {
  }

  ngOnInit() {
    this.global.showHideConfirmPopup.subscribe((opt) => {
      if (opt.id !== this.id) return;

      this.show = opt.show;
      this.values = opt.values;
    });
  }

  onSuccessClick() {
    this.onSuccessEmitter.emit();
    this.hide();
  }

  onCancelClick() {
    this.onCancelEmitter.emit();
    this.hide();
  }

  hide() {
    this.show = false;
  }
}
