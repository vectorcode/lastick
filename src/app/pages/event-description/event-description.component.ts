import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-event-description',
  templateUrl: './event-description.component.html',
  styleUrls: ['./event-description.component.less']
})
export class EventDescriptionComponent implements OnInit {
    event_uuid:any;

    constructor(private route: ActivatedRoute, private router: Router) {
        this.route.params.subscribe(data => {

            this.event_uuid = data.event_uuid;

            //this.router.navigate(['']);
        })
    }

  ngOnInit() {
  }

}
