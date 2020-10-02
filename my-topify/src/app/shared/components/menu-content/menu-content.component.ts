/*
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-menu-content',
  templateUrl: './menu-content.component.html',
  styleUrls: ['../../style/common.css', './menu-content.component.css']
})
export class MenuContentComponent implements OnInit {

  constructor(private router: Router,
              private authService: AuthService) { }

  ngOnInit() {
  }

  onProceedToGame() {
    this.router.navigate(['game/select']);
  }

  onProceedToChart() {
    this.router.navigate(['chart/view']);
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['']);
  }
}
