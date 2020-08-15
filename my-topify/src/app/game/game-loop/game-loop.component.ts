import { Component, OnInit } from '@angular/core';
import { GameService } from '../game.service';
import { Question, ResourceType, DisplayableQuestion } from 'src/app/shared/types';
import { GameConfiguratorService } from '../game-selector/game-configurator.service';

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
    this.game.answerQuestion();
    this.updateQuestion();
  }

  onAnswerRight() {
    this.game.answerQuestion();
    this.updateQuestion();
  }

  private updateQuestion() {
    this.question = this.game.nextQuestion();
    this.leftText = this.question.leftText.join(' ');
    this.rightText = this.question.rightText.join(' ');
  }
}
