import { Component, AfterViewInit, ViewChild, ElementRef, Renderer2, OnInit, OnDestroy } from '@angular/core';
import { GameService } from '../game.service';
import { DisplayableQuestion, Item, DisplayableText } from 'src/app/shared/types';
import { Router } from '@angular/router';
import { ResourceManagerService } from 'src/app/shared/resource-manager.service';
import { Subscription } from 'rxjs';
import { ScreenService } from 'src/app/shared/screen.service';

const PRE_SELECT_TIMEOUT = 150; // ms
const HOLD_SELECT_TIMEOUT = 2500; // ms
const CANCEL_SELECT_TIMEOUT = 50; // ms
const SHOW_ANSWER_TIMEOUT = 5000; 

enum Choice {
  Left,
  Right
}

enum Answer {
  CorrectLeft,
  WrongLeft,
  CorrectRight,
  WrongRight,
  None
}

@Component({
  selector: 'app-game-loop',
  templateUrl: './game-loop.component.html',
  styleUrls: ['./game-loop.component.css']
})
export class GameLoopComponent implements OnInit, AfterViewInit, OnDestroy {

  public choiceType = Choice;
  public answerType = Answer;

  private narrowScreen = false;

  private question: DisplayableQuestion;
  private leftText: DisplayableText;
  private rightText: DisplayableText;

  //TODO determine if this neeeds changing (currently there are 2 places with the same name)
  // do we switch between narrow and wide screen??
  @ViewChild('leftImagePlaceholder', {static: false}) leftImagePlaceholder: ElementRef;
  @ViewChild('rightImagePlaceholder', {static: false}) rightImagePlaceholder: ElementRef;

  private images: HTMLImageElement[];
  private audio: HTMLAudioElement[];

  private leftAudioPlaying = false;
  private rightAudioPlaying = false;

  private preSelectTimerId: number;
  private holdSelectTimerId: number;
  private cancelSelectTimerId: number;

  private selectingChoice: Choice;
  private answered = Answer.None;

  private mousedownOnLeftHandler: any;
  private mousedownOnRightHandler: any;
  private mouseupOnLeftHandler: any;
  private mouseupOnRightHandler: any;
  private clickOnLeftHandler: any;
  private clickOnRightHandler: any;

  private resourceReloadSub: Subscription;
  
  private screenSizeSub: Subscription;

  constructor(private screen: ScreenService,
              private game: GameService,
              private resourceManager: ResourceManagerService,
              private router: Router,
              private renderer: Renderer2) {

                this.mousedownOnLeftHandler = this.startLeftSelection.bind(this);
                this.mousedownOnRightHandler = this.startRightSelection.bind(this);
                this.mouseupOnLeftHandler = this.startCancellingSelection.bind(this);
                this.mouseupOnRightHandler = this.startCancellingSelection.bind(this);
                this.clickOnLeftHandler = this.toggleAudioLeft.bind(this);
                this.clickOnRightHandler = this.toggleAudioRight.bind(this);
  }

  ngOnInit() {
    this.narrowScreen = this.screen.isNarrowScreen();
    //console.log(this.narrowScreen);
    this.screenSizeSub = this.screen.screenIsNarrowChanged().subscribe((value: boolean) => {
      this.narrowScreen = value;
      //console.log(this.narrowScreen);
    });
    
    this.resourceReloadSub = this.resourceManager.resourceReload().subscribe(() => {
      this.updateResources();
    });

    this.updateQuestion();
  }

  ngOnDestroy() {
    this.disableUserInteraction();

    this.screenSizeSub.unsubscribe();
    this.screenSizeSub = undefined;

    this.resourceReloadSub.unsubscribe();
    this.resourceReloadSub = undefined;
  }

  ngAfterViewInit() {
    this.enableUserInteraction();
    this.updateResources();
  }

  private enableUserInteraction() {
    this.leftImagePlaceholder.nativeElement.addEventListener('mousedown', this.mousedownOnLeftHandler);
    this.rightImagePlaceholder.nativeElement.addEventListener('mousedown', this.mousedownOnRightHandler);

    this.leftImagePlaceholder.nativeElement.addEventListener('mouseup', this.mouseupOnLeftHandler);
    this.rightImagePlaceholder.nativeElement.addEventListener('mouseup', this.mouseupOnRightHandler);

    this.leftImagePlaceholder.nativeElement.addEventListener('click', this.clickOnLeftHandler);
    this.rightImagePlaceholder.nativeElement.addEventListener('click', this.clickOnRightHandler);
  }

  private disableUserInteraction() {
    this.leftImagePlaceholder.nativeElement.removeEventListener('mousedown', this.mousedownOnLeftHandler);
    this.rightImagePlaceholder.nativeElement.removeEventListener('mousedown', this.mousedownOnRightHandler);

    this.leftImagePlaceholder.nativeElement.addEventListener('mouseup', this.mouseupOnLeftHandler);
    this.rightImagePlaceholder.nativeElement.addEventListener('mouseup', this.mouseupOnRightHandler);

    this.leftImagePlaceholder.nativeElement.removeEventListener('click', this.clickOnLeftHandler);
    this.rightImagePlaceholder.nativeElement.removeEventListener('click', this.clickOnRightHandler);
  }

  private startLeftSelection() {
    // cancelSelection at start?

    // start small timeout to enter selecting mode
    this.preSelectTimerId = window.setTimeout((which: Choice) => {
      this.startSelectionTimer(which);
    }, PRE_SELECT_TIMEOUT, Choice.Left);
  }

  private startRightSelection() {
    // start small timeout to enter selecting mode
    this.preSelectTimerId = window.setTimeout((which: Choice) => {
      this.startSelectionTimer(which);
    }, PRE_SELECT_TIMEOUT, Choice.Right);
  }

  private startCancellingSelection() {
    // start small timeout to leave selecting mode
    this.cancelSelectTimerId = window.setTimeout(() => {
      this.cancelSelection();
    }, CANCEL_SELECT_TIMEOUT);
  }

  private cancelSelection() {
    if (this.preSelectTimerId) {
      window.clearTimeout(this.preSelectTimerId);
    }

    if (this.holdSelectTimerId) {
      window.clearTimeout(this.holdSelectTimerId);
    }

    if (this.cancelSelectTimerId) {
      window.clearTimeout(this.cancelSelectTimerId);
    }

    this.selectingChoice = undefined;
    this.preSelectTimerId = undefined;
    this.holdSelectTimerId = undefined;
    this.cancelSelectTimerId = undefined;
  }

  private startSelectionTimer(which: Choice) {
    this.selectingChoice = which;
    this.holdSelectTimerId = window.setTimeout(() => {
      this.onAnswer(which);
    }, HOLD_SELECT_TIMEOUT);

    // in selecting mode, wait some time and animate border
    // at the end trigger onAnswer
  }

  onAnswer(which: Choice) {
    this.disableUserInteraction();

    let correct: boolean;

    switch (which) {
      case Choice.Left:
        correct = this.game.answerQuestion(this.question.iLeft);
        if (correct) {
          this.answered = Answer.CorrectLeft;
        } else {
          this.answered = Answer.WrongLeft;
        }
        break;
      
      case Choice.Right:
        correct = this.game.answerQuestion(this.question.iRight);
        if (correct) {
          this.answered = Answer.CorrectRight;
        } else {
          this.answered = Answer.WrongRight;
        }
        break;
    }

    this.cancelSelection();

    // go to next question
    // TODO when to clear timeout?
    window.setTimeout(() => {
      if (this.updateQuestion()) {
        this.updateResources();
        this.enableUserInteraction();
      }
    }, SHOW_ANSWER_TIMEOUT);

  }

  private updateQuestion() {
    if (this.game.isGameOver()) {
      this.router.navigate(['game/end-screen']);
      return false;
    }

    this.answered = Answer.None;

    this.question = this.game.nextQuestion();

    this.leftText = this.question.leftText;
    this.rightText = this.question.rightText;

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
    this.pauseAudioLeft();
    this.pauseAudioRight();

    this.audio = this.resourceManager.getAudioForQuestion(this.question);
  }

  private toggleAudioLeft() {
    if (this.selectingChoice === Choice.Left) {
      return; // was in selection mode, ignore
    }

    if (this.answered !== Answer.None) {
      return;
    }

    if (this.leftAudioPlaying) {
      this.pauseAudioLeft();
    } else {
      this.pauseAudioRight();
      this.playAudioLeft();
    }
  }

  private toggleAudioRight() {
    if (this.selectingChoice === Choice.Right) {
      return; // was in selection mode, ignore
    }

    if (this.answered !== Answer.None) {
      return;
    }

    if (this.rightAudioPlaying) {
      this.pauseAudioRight();
    } else {
      this.pauseAudioLeft();
      this.playAudioRight();
    }
  }

  private playAudioLeft() {
    if (this.audio) {
      this.audio[0].play();
      this.leftAudioPlaying = true;
    }
  }

  private pauseAudioLeft() {
    if (this.audio) {
      this.audio[0].pause();
      this.leftAudioPlaying = false;
    }
  }

  private playAudioRight() {
    if (this.audio) {
      this.audio[1].play();
      this.rightAudioPlaying = true;
    }
  }

  private pauseAudioRight() {
    if (this.audio) {
      this.audio[1].pause();
      this.rightAudioPlaying = false;
    }
  }

}
