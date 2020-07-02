import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';

import { AccountService } from '@app/services';

@Component({ templateUrl: 'list.component.html' })
export class ListComponent implements OnInit {
    user = null;

    constructor(private accountService: AccountService) {
        
    }

    ngOnInit() {
        this.accountService.getMe()
            .pipe(first())
            .subscribe(user => this.user = user);
    }
}