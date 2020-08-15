import { Injectable } from '@angular/core';
import { Question, GameKnowledgeBase, Period } from '../shared/types';

@Injectable({providedIn: 'root'})
export class GameService {

  private knowledgeBase: GameKnowledgeBase;

  private questions: Question[];

  private atQuestion = -1;
  private nQuestions: number;

  setKnowledgeBase(kb: GameKnowledgeBase) {
    this.knowledgeBase = kb;
  }

  getTrackName(period: Period, index: number) {
    return this.knowledgeBase.getTrack(period, index).name;
  }

  getArtistName(period: Period, index: number) {
    return this.knowledgeBase.getArtist(period, index).name;
  }

  setQuestions(questions: Question[]) {
    this.questions = questions;
    this.nQuestions = this.questions.length;
  }

  nextQuestion(): Question {
    if (!this.questions || this.atQuestion >= this.nQuestions - 1) {
      return null;
    }

    this.atQuestion++;

    return this.questions[this.atQuestion];
  }

  answerQuestion() {
  }

}
