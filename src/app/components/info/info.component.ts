import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../services/global.service';
import { IInfoPopup } from '../../types/IInfoPopup';

@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.less']
})
export class InfoComponent implements OnInit {
    show: boolean = false;
    type: string = '';
    timer: number = 3000;
    msg: string;
  constructor(private global: GlobalService) {

      this.global.showHideInfo.subscribe((e:IInfoPopup) => {

          this.type = e.type ;//error/success
          this.msg = e.msg;
          this.timer = e.timer ? e.timer : null;

          this.show = true;
          if(e.timer){setTimeout(() => this.show = false , this.timer);}

      });
  }



  ngOnInit() {
  }

}
