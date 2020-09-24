import { Component, AfterViewInit, ViewChild, ElementRef, Renderer2, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
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
  styleUrls: ['../../shared/style/common.css', './game-loop.component.css']
})
export class GameLoopComponent implements OnInit, AfterViewInit, OnDestroy {

  public choiceType = Choice;
  public answerType = Answer;

  private narrowScreen = false;

  private question: DisplayableQuestion;
  private leftText: DisplayableText;
  private rightText: DisplayableText;

  private newLeftImagePlaceholder: ElementRef;
  private leftImagePlaceholder: ElementRef;
  @ViewChild('leftImagePlaceholder', {static: false}) set contentLeft(content: ElementRef) {
    if (this.leftImagePlaceholder) {
      this.newLeftImagePlaceholder = content;
      this.checkIfViewElementsNeedUpdate();
    } else {
      this.leftImagePlaceholder = content;
    }
  }

  private newRightImagePlaceholder: ElementRef;
  private rightImagePlaceholder: ElementRef;
  @ViewChild('rightImagePlaceholder', {static: false}) set contentRight(content: ElementRef) {
    if (this.rightImagePlaceholder) {
      this.newRightImagePlaceholder = content;
      this.checkIfViewElementsNeedUpdate();
    } else {
      this.rightImagePlaceholder = content;
    }
  }

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

  private gameIsOver = false;

  constructor(private screen: ScreenService,
              private game: GameService,
              private resourceManager: ResourceManagerService,
              private router: Router,
              private renderer: Renderer2,
              private cdRef: ChangeDetectorRef) {

                if (!this.game.isReady()) {
                  this.router.navigate(['game/select']);
                }

                this.mousedownOnLeftHandler = this.startLeftSelection.bind(this);
                this.mousedownOnRightHandler = this.startRightSelection.bind(this);
                this.mouseupOnLeftHandler = this.startCancellingSelection.bind(this);
                this.mouseupOnRightHandler = this.startCancellingSelection.bind(this);
                this.clickOnLeftHandler = this.toggleAudioLeft.bind(this);
                this.clickOnRightHandler = this.toggleAudioRight.bind(this);
  }

  ngOnInit() {
    this.narrowScreen = this.screen.isNarrowScreen();

    this.screenSizeSub = this.screen.screenIsNarrowChanged().subscribe((value: boolean) => {
      this.narrowScreen = value;
    });
    
    this.resourceReloadSub = this.resourceManager.resourceReload().subscribe(() => {
      this.updateResources();
    });

    this.updateQuestion();
  }

  ngOnDestroy() {
    this.disableUserInteraction();
    this.removeResources();

    if (this.screenSizeSub) {
      this.screenSizeSub.unsubscribe();
      this.screenSizeSub = undefined;
    }

    if (this.resourceReloadSub) {
      this.resourceReloadSub.unsubscribe();
      this.resourceReloadSub = undefined;
    }
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
    if (!this.leftImagePlaceholder || !this.rightImagePlaceholder) {
      return;
    }

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
      this.gameIsOver = true;
      return false;
    }

    this.answered = Answer.None;

    this.question = this.game.nextQuestion();

    this.leftText = this.question.leftText;
    this.rightText = this.question.rightText;

    return true;
  }

  private updateResources() {
    this.removeResources();
    this.addResources();
  }

  private removeResources() {
    // images
    if (this.images) {
      this.renderer.removeChild(this.leftImagePlaceholder.nativeElement, this.images[0]);
      this.renderer.removeChild(this.rightImagePlaceholder.nativeElement, this.images[1]);
    }

    // audio
    this.pauseAudioLeft();
    this.pauseAudioRight();
  }

  private addResources() {
    // images 
    this.images = this.resourceManager.getImagesForQuestion(this.question);

    this.renderer.appendChild(this.leftImagePlaceholder.nativeElement, this.images[0]);
    this.renderer.appendChild(this.rightImagePlaceholder.nativeElement, this.images[1]);

    // audio
    this.audio = this.resourceManager.getAudioForQuestion(this.question);
  }

  private checkIfViewElementsNeedUpdate() {
    if (this.newLeftImagePlaceholder && this.newRightImagePlaceholder) {
      this.disableUserInteraction();
      this.removeResources();

      this.leftImagePlaceholder = this.newLeftImagePlaceholder;
      this.rightImagePlaceholder = this.newRightImagePlaceholder;

      this.newLeftImagePlaceholder = undefined;
      this.newRightImagePlaceholder = undefined;

      this.addResources();
      this.enableUserInteraction();

      this.cdRef.detectChanges();
    }
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
