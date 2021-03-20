/*
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import { Injectable } from '@angular/core';
import { Item, Period } from 'spotify-lib';
import { Question, GameKnowledgeBase, DisplayableQuestion } from '../shared/types';
import { getTrackShortName, getFirstArtist } from '../shared/utility';

@Injectable({providedIn: 'root'})
export class GameService {

  private knowledgeBase: GameKnowledgeBase;

  private questions: Question[];

  private atQuestion = -1;
  private nQuestions: number;

  private maxLives = 3;
  private lives = this.maxLives;
  private score = 0;

  private rating: number;

  private ratingQuotes = [
    'The only true wisdom is in knowing you know nothing.',
    'Any fool can know. The point is to understand.',
    'The hardest thing of all is to find a black cat in a dark room, especially if there is no cat.',
    'Knowledge is a weapon. I intend to be formidably armed.',
    'Great minds are always feared by lesser minds.',
    'When you reach the end of what you should know, you will be at the beginning of what you should sense.'
  ];

  private ratingImages = [
    '/assets/images/ratings/r1.jpg',
    '/assets/images/ratings/r2.jpg',
    '/assets/images/ratings/r3.png',
    '/assets/images/ratings/r4.png',
    '/assets/images/ratings/r5.jpg',
    '/assets/images/ratings/r6.jpg'
  ];

  // knowledge base
  setKnowledgeBase(kb: GameKnowledgeBase) {
    this.knowledgeBase = kb;
  }

  // questions
  setQuestions(questions: Question[]) {
    this.questions = questions;
    this.nQuestions = this.questions.length;
  }

  isReady() {
    if (this.knowledgeBase && this.questions) {
      return true;
    }

    return false;
  }

  getTrackNameArtistsAlbum(period: Period, index: number): string[] {
    const t = this.knowledgeBase.getTrack(period, index);

    return [t.name, t.artists.join(', '), t.album.name];
  }

  getArtistName(period: Period, index: number) {
    return this.knowledgeBase.getArtist(period, index).name;
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
    let lText = {track: '', artist: '', album: ''};
    let rText = {track: '', artist: '', album: ''};
    
    switch (q.category.type) {
      case Item.Artist:
        lText.artist = this.getArtistName(q.category.period, q.iLeft);
        rText.artist = this.getArtistName(q.category.period, q.iRight);
        break;

      case Item.Track:
        let info = this.getTrackNameArtistsAlbum(q.category.period, q.iLeft);
        lText.track = getTrackShortName(info[0]);
        lText.artist = getFirstArtist(info[1]);
        lText.album = info[2];

        info = this.getTrackNameArtistsAlbum(q.category.period, q.iRight);
        rText.track = getTrackShortName(info[0]);
        rText.artist = getFirstArtist(info[1]);
        rText.album = info[2];

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

    this.rating = undefined;
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

  getRatingQuote() {
    if (!this.rating) {
      this.determineRating();
    }

    return this.ratingQuotes[this.rating];
  }

  getRatingImage() {
    if (!this.rating) {
      this.determineRating();
    }

    return this.ratingImages[this.rating];
  }

  private determineRating() {
    if (this.score <= 4) {
      this.rating = 0;
    } else if (this.score <= 9) {
      this.rating = 1;
    } else if (this.score <= 14) {
      this.rating = 2;
    } else if (this.rating <= 19) {
      this.rating = 3;
    } else if (this.rating <= 25 && this.lives < this.maxLives) {
      this.rating = 4;
    } else {
      this.rating = 5;
    }
  }
}
