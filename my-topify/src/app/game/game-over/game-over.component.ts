import { Component, OnInit } from '@angular/core';
import { GameService } from '../game.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-game-over',
  templateUrl: './game-over.component.html',
  styleUrls: ['./game-over.component.css']
})
export class GameOverComponent implements OnInit {

  constructor(private game: GameService,
              private router: Router) { }

  ngOnInit() {
  }

  onPlayAgain() {
    this.router.navigate(['game/select']);
  }
}
