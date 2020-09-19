import { Component, OnInit } from '@angular/core';
import { MenuService } from '../../menu.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['../../style/common.css', './menu.component.css']
})
export class MenuComponent implements OnInit {

  showMenu = false;

  constructor(private menu: MenuService) { 
    this.menu.registerMenu(this.onOpenMenu.bind(this));
  }

  ngOnInit() {
  }

  onOpenMenu() {
    this.showMenu = true;
  }

  onCloseMenu() {
    this.showMenu = false;
  }

}
