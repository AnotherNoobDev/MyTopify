/*
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import { Injectable } from '@angular/core';

@Injectable({providedIn: 'root'})
export class MenuService {
  
  private openMenuCallback: (() => void) | undefined = undefined;
  
  registerMenu(onOpenMenuCallback: () => void) {
    this.openMenuCallback = onOpenMenuCallback;
  }

  openMenu() {
    if (this.openMenuCallback) {
      this.openMenuCallback();
    }
  }
}
