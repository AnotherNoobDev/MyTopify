import { Component, OnInit } from '@angular/core';
import { GameService } from '../game.service';
import { DisplayableQuestion } from 'src/app/shared/types';

@Component({
  selector: 'app-game-loop',
  templateUrl: './game-loop.component.html',
  styleUrls: ['./game-loop.component.css']
})
export class GameLoopComponent implements OnInit {

  private question: DisplayableQuestion;
  private leftText = '';
  private rightText = '';

  constructor(private game: GameService) { 
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
      // navigate to game over component?
      return;
    }

    this.question = this.game.nextQuestion();
    this.leftText = this.question.leftText.join(' ');
    this.rightText = this.question.rightText.join(' ');
  }
}
