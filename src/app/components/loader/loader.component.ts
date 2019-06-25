import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../services/global.service';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.less']
})
export class LoaderComponent implements OnInit {
  show: boolean = false;
  constructor(private global: GlobalService) {

    this.global.showHideLoader.subscribe((e:boolean) => {
          this.show = e;
    });
  }

  ngOnInit() {
  }

}
