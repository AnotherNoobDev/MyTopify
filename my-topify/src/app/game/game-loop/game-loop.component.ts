import { Component, AfterViewInit, ViewChild, ElementRef, Renderer2, OnInit, OnDestroy } from '@angular/core';
import { GameService } from '../game.service';
import { DisplayableQuestion, Item } from 'src/app/shared/types';
import { Router } from '@angular/router';
import { ResourceManagerService } from 'src/app/shared/resource-manager.service';

@Component({
  selector: 'app-game-loop',
  templateUrl: './game-loop.component.html',
  styleUrls: ['./game-loop.component.css']
})
export class GameLoopComponent implements OnInit, AfterViewInit, OnDestroy {

  private question: DisplayableQuestion;
  private leftText = '';
  private rightText = '';

  @ViewChild('leftImagePlaceholder', {static: false}) leftImagePlaceholder: ElementRef;
  @ViewChild('rightImagePlaceholder', {static: false}) rightImagePlaceholder: ElementRef;

  private images: HTMLImageElement[];
  private audio: HTMLAudioElement[];

  constructor(private game: GameService,
              private resourceManager: ResourceManagerService,
              private router: Router,
              private renderer: Renderer2) { 
  }

  ngOnInit() {
    this.updateQuestion();
  }

  ngOnDestroy() {
    // bind?
    this.leftImagePlaceholder.nativeElement.removeEventListener('mouseenter', this.playAudioLeft);
    this.rightImagePlaceholder.nativeElement.removeEventListener('mouseenter', this.playAudioRight);

    this.leftImagePlaceholder.nativeElement.removeEventListener('mouseleave', this.pauseAudioLeft.bind);
    this.rightImagePlaceholder.nativeElement.removeEventListener('mouseleave', this.pauseAudioRight);
  }

  ngAfterViewInit() {
    this.leftImagePlaceholder.nativeElement.addEventListener('mouseenter', this.playAudioLeft.bind(this));
    this.rightImagePlaceholder.nativeElement.addEventListener('mouseenter', this.playAudioRight.bind(this));

    this.leftImagePlaceholder.nativeElement.addEventListener('mouseleave', this.pauseAudioLeft.bind(this));
    this.rightImagePlaceholder.nativeElement.addEventListener('mouseleave', this.pauseAudioRight.bind(this));

    this.updateResources();
  }

  onAnswerLeft() {
    const correct = this.game.answerQuestion(this.question.iLeft);
    if (this.updateQuestion()) {
      this.updateResources();
    }
  }

  onAnswerRight() {
    const correct = this.game.answerQuestion(this.question.iRight);
    if (this.updateQuestion()) {
      this.updateResources();
    }
  }

  private updateQuestion() {
    if (this.game.isGameOver()) {
      this.router.navigate(['game/end-screen']);
      return false;
    }

    this.question = this.game.nextQuestion();
    this.leftText = this.question.leftText.join(' ');
    this.rightText = this.question.rightText.join(' ');

    return true;
  }

  private updateResources() {
    // images
    if (this.images) {
      this.renderer.removeChild(this.leftImagePlaceholder.nativeElement, this.images[0]);
      this.renderer.removeChild(this.rightImagePlaceholder.nativeElement, this.images[1]);
    }

    this.images = this.resourceManager.getImagesForQuestion(this.question);

    this.renderer.appendChild(this.leftImagePlaceholder.nativeElement, this.images[0]);
    this.renderer.appendChild(this.rightImagePlaceholder.nativeElement, this.images[1]);

    // audio
    this.audio = this.resourceManager.getAudioForQuestion(this.question);
  }

  private playAudioLeft() {
    if (this.audio) {
      this.audio[0].play();
    }
  }

  private pauseAudioLeft() {
    if (this.audio) {
      this.audio[0].pause();
    }
  }

  private playAudioRight() {
    if (this.audio) {
      this.audio[1].play();
    }
  }

  private pauseAudioRight() {
    if (this.audio) {
      this.audio[1].pause();
    }
  }

}
