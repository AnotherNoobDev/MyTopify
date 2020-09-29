import { Component, OnInit } from '@angular/core';
import { GameService } from '../game.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-game-over',
  templateUrl: './game-over.component.html',
  styleUrls: ['../../shared/style/common.css', './game-over.component.css']
})
export class GameOverComponent implements OnInit {

  constructor(public game: GameService,
              private router: Router) { }

  ngOnInit() {
  }

  toSelectionScreen() {
    this.router.navigate(['game/select']);
  }
}
