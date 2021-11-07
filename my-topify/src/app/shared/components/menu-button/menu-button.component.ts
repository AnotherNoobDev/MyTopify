/*
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import { Component } from '@angular/core';
import { MenuService } from '../../menu.service';

@Component({
  selector: 'app-menu-button',
  templateUrl: './menu-button.component.html',
  styleUrls: ['../../style/common.css', './menu-button.component.css']
})
export class MenuButtonComponent {

  constructor(private menu: MenuService) { }


  openMenu() {
    this.menu.openMenu();
  }
}
