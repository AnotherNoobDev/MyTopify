/*
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import { Component } from '@angular/core';
import { GameService } from '../game.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-game-over',
  templateUrl: './game-over.component.html',
  styleUrls: ['../../shared/style/common.css', './game-over.component.css']
})
export class GameOverComponent {

  constructor(public game: GameService,
              private router: Router) { }


  toSelectionScreen() {
    this.router.navigate(['game/select']);
  }
}
