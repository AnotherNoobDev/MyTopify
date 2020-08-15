import { Component, OnInit } from '@angular/core';
import { GameService } from '../game.service';
import { Question, ResourceType } from 'src/app/shared/types';
import { GameConfiguratorService } from '../game-selector/game-configurator.service';

@Component({
  selector: 'app-game-loop',
  templateUrl: './game-loop.component.html',
  styleUrls: ['./game-loop.component.css']
})
export class GameLoopComponent implements OnInit {

  private question: Question;
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

    // TODO REFACTOR THIS
    switch (this.question.category.type) {
      case ResourceType.Artist:
        this.leftText = this.game.getArtistName(this.question.category.period, this.question.iLeft);
        this.rightText = this.game.getArtistName(this.question.category.period, this.question.iRight);
        break;

      case ResourceType.Track:
        this.leftText = this.game.getTrackName(this.question.category.period, this.question.iLeft);
        this.rightText = this.game.getTrackName(this.question.category.period, this.question.iRight);
        break;
    }
  }
}
