import {Component, Input, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-button-cart',
  templateUrl: './button-cart.component.html',
  styleUrls: ['./button-cart.component.less']
})
export class ButtonCartComponent implements OnInit {

  @Input() cartTotalItems: number;
  @Input() cartTotalCost: number;

  constructor(private translate: TranslateService) { }

  ngOnInit() {
  }

}
