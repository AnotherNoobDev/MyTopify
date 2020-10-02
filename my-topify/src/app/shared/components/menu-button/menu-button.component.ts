/*
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import { Component, OnInit } from '@angular/core';
import { MenuService } from '../../menu.service';

@Component({
  selector: 'app-menu-button',
  templateUrl: './menu-button.component.html',
  styleUrls: ['../../style/common.css', './menu-button.component.css']
})
export class MenuButtonComponent implements OnInit {

  constructor(private menu: MenuService) { }

  ngOnInit() {
  }

  openMenu() {
    this.menu.openMenu();
  }

}
