import { Component, OnInit } from '@angular/core';
import { GameService } from '../game.service';
import { DisplayableQuestion } from 'src/app/shared/types';
import { Router } from '@angular/router';

@Component({
  selector: 'app-game-loop',
  templateUrl: './game-loop.component.html',
  styleUrls: ['./game-loop.component.css']
})
export class GameLoopComponent implements OnInit {

  private question: DisplayableQuestion;
  private leftText = '';
  private rightText = '';

  constructor(private game: GameService,
              private router: Router) { 
  }

  ngOnInit() {
    this.updateQuestion();
  }

  onAnswerLeft() {
    const correct = this.game.answerQuestion(this.question.iLeft);
    this.updateQuestion();
  }

  onAnswerRight() {
    const correct = this.game.answerQuestion(this.question.iRight);
    this.updateQuestion();
  }

  private updateQuestion() {
    if (this.game.isGameOver()) {
      this.router.navigate(['game/end-screen']);
      return;
    }

    this.question = this.game.nextQuestion();
    this.leftText = this.question.leftText.join(' ');
    this.rightText = this.question.rightText.join(' ');
  }
}
