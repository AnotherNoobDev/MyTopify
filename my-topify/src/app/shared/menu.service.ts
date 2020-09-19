import { Injectable } from '@angular/core';

@Injectable({providedIn: 'root'})
export class MenuService {
  
  private openMenuCallback: () => void;
  
  registerMenu(onOpenMenuCallback: () => void) {
    this.openMenuCallback = onOpenMenuCallback;
  }

  openMenu() {
    if (this.openMenuCallback) {
      this.openMenuCallback();
    }
  }
}
