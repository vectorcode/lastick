import {
  Component,
  ElementRef,
  Renderer2,
  OnInit,
  ViewEncapsulation,
  EventEmitter,
  Output, Input, ViewChild, OnDestroy
} from '@angular/core';
import {LoggerService} from '../../services/logger.service';

@Component({
  selector: 'app-infinite-scroll, [infiniteScroll]',
  templateUrl: './infinite-scroll.component.html',
  styleUrls: ['./infinite-scroll.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class InfiniteScrollComponent implements OnInit, OnDestroy {
  page = 1;
  hidden = false;
  @Output() scrollEndEmitter: EventEmitter<number> = new EventEmitter();
  @Input() work: boolean;
  @Input() destroy: boolean = false;

  constructor(private currentElement: ElementRef, private renderer: Renderer2, private logger: LoggerService) {
  }

  ngOnInit() {
    this.logger.l('init scroll');

    this.onScroll = this.onScroll.bind(this);
    this.onScroll();

    window.addEventListener('scroll', this.onScroll);
  }

  ngOnDestroy() {
    window.removeEventListener('scroll', this.onScroll);
  }

  onScroll() {
    if (window.innerHeight + pageYOffset >= document.body.clientHeight && this.work) {
      this.scrollEndEmitter.emit(this.page);
      this.page++;
    }

    if (this.destroy) {
      window.removeEventListener('scroll', this.onScroll);
    }
  }
}
