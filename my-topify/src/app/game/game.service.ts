import { Injectable } from '@angular/core';
import { Question, GameKnowledgeBase, Period, DisplayableQuestion, Item } from '../shared/types';

@Injectable({providedIn: 'root'})
export class GameService {

  private knowledgeBase: GameKnowledgeBase;

  private questions: Question[];

  private atQuestion = -1;
  private nQuestions: number;

  private lives = 3;
  private score = 0;

  // knowledge base
  setKnowledgeBase(kb: GameKnowledgeBase) {
    this.knowledgeBase = kb;
  }

  getTrackNameArtistsAlbum(period: Period, index: number): string[] {
    const t = this.knowledgeBase.getTrack(period, index);

    return [t.name, 'by ' + t.artists.join(', '), 'from ' + t.album.name];
  }

  getArtistName(period: Period, index: number) {
    return this.knowledgeBase.getArtist(period, index).name;
  }

  // questions
  setQuestions(questions: Question[]) {
    this.questions = questions;
    this.nQuestions = this.questions.length;
  }

  nextQuestion(): DisplayableQuestion {
    if (!this.questions || this.atQuestion >= this.nQuestions - 1) {
      return null;
    }

    this.atQuestion++;

    const q = this.questions[this.atQuestion];

    return this.getDisplayableQuestion(q);
  }

  private getDisplayableQuestion(q: Question): DisplayableQuestion {
    let lText = [];
    let rText = [];
    
    switch (q.category.type) {
      case Item.Artist:
        lText.push(this.getArtistName(q.category.period, q.iLeft));
        rText.push(this.getArtistName(q.category.period, q.iRight));
        break;

      case Item.Track:
        lText = this.getTrackNameArtistsAlbum(q.category.period, q.iLeft);
        rText = this.getTrackNameArtistsAlbum(q.category.period, q.iRight);
        break;
    }

    const dq = {
      ...q,
      leftText: lText,
      rightText: rText
    };

    return dq;
  }

  answerQuestion(answer: number): boolean {
    const correct = answer === this.questions[this.atQuestion].answer;

    if (correct) {
      this.score++;
    } else {
      this.lives--;
    }

    return correct;
  }

  // game state
  restart() {
    this.atQuestion = -1;
    this.lives = 3;
    this.score = 0;
  }

  isGameOver() {
    return (this.lives <= 0 || this.atQuestion === this.nQuestions - 1);
  }

  // statistics
  getLives() {
    return this.lives;
  }

  getScore() {
    return this.score;
  }

  getQuestionNumber() {
    return this.atQuestion + 1;
  }

  getNumberOfQuestions() {
    return this.nQuestions;
  }
}
