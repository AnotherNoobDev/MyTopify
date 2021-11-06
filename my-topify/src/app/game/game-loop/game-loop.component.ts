/*
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import { Component, AfterViewInit, ViewChild, ElementRef, Renderer2, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { GameService } from '../game.service';
import { DisplayableQuestion } from 'src/app/shared/types';
import { Router } from '@angular/router';
import { ResourceManagerService } from 'src/app/shared/resource-manager.service';
import { Subscription } from 'rxjs';
import { ScreenService } from 'src/app/shared/screen.service';
import { NotificationPriority, NotificationsService, NotificationType } from 'notifications-lib';

const PRE_SELECT_TIMEOUT = 150; // ms
const HOLD_SELECT_TIMEOUT = 2500; // ms
const CANCEL_SELECT_TIMEOUT = 50; // ms
const SHOW_ANSWER_TIMEOUT = 5000; 
const TAP_TIMEOUT = 120;

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

  public question: DisplayableQuestion | null = null;

  @ViewChild('leftImagePlaceholder', {static: false}) leftImagePlaceholder: ElementRef | undefined = undefined;
  @ViewChild('rightImagePlaceholder', {static: false}) rightImagePlaceholder: ElementRef | undefined = undefined;

  public images: HTMLImageElement[] = [];
  private audio: (HTMLAudioElement | undefined)[] | null = null;

  public leftAudioPlaying = false;
  public rightAudioPlaying = false;

  public selectingChoice: Choice | undefined = undefined;
  private preSelectTimerId: number | undefined = undefined;
  private holdSelectTimerId: number | undefined = undefined;
  private cancelSelectTimerId: number | undefined = undefined;
  
  private showAnswerTimerId: number | undefined = undefined;
  
  public answered = Answer.None;

  private mousedownOnLeftHandler: () => void;
  private mousedownOnRightHandler: () => void;
  private mouseupOnLeftHandler: () => void;
  private mouseupOnRightHandler: () => void;
  private clickOnLeftHandler: () => void;
  private clickOnRightHandler: () => void;
  private touchstartOnLeftHandler: (e: Event) => void;
  private touchstartOnRightHandler: (e: Event) => void;
  private touchendOnLeftHandler: (e: Event) => void;
  private touchendOnRightHandler: (e: Event) => void;

  private leftTapTime: number = 0; 
  private rightTapTime: number = 0;

  private resourceReloadSub: Subscription | undefined = undefined;

  public gameIsOver = false;

  constructor(private screen: ScreenService,
              public game: GameService,
              private resourceManager: ResourceManagerService,
              private router: Router,
              private renderer: Renderer2,
              private cdRef: ChangeDetectorRef,
              private notificationService: NotificationsService) {

                if (!this.game.isReady()) {
                  this.router.navigate(['game/select']);
                }

                this.mousedownOnLeftHandler = this.startLeftSelection.bind(this);
                this.mousedownOnRightHandler = this.startRightSelection.bind(this);
                this.mouseupOnLeftHandler = this.startCancellingSelection.bind(this);
                this.mouseupOnRightHandler = this.startCancellingSelection.bind(this);
                this.clickOnLeftHandler = this.toggleAudioLeft.bind(this);
                this.clickOnRightHandler = this.toggleAudioRight.bind(this);
                this.touchstartOnLeftHandler = this.handleTouchStartOnLeft.bind(this);
                this.touchstartOnRightHandler = this.handleTouchStartOnRight.bind(this);
                this.touchendOnLeftHandler = this.handleTouchEndOnLeft.bind(this);
                this.touchendOnRightHandler = this.handleTouchEndOnRight.bind(this);
  }

  ngOnInit() {    
    this.resourceReloadSub = this.resourceManager.resourceReload().subscribe(() => {
      this.updateResources();
    });

    this.updateQuestion();
    this.updateResources();
  }

  ngOnDestroy() {
    this.disableUserInteraction();
    this.pauseAudio();

    if (this.resourceReloadSub) {
      this.resourceReloadSub.unsubscribe();
    }

    if (this.showAnswerTimerId) {
      window.clearTimeout(this.showAnswerTimerId);
    }
  }

  ngAfterViewInit() {
    this.enableUserInteraction();
  }

  private enableUserInteraction() {
    if (!this.leftImagePlaceholder || !this.rightImagePlaceholder) {
      return;
    }

    const leftElement = this.leftImagePlaceholder.nativeElement as HTMLElement;
    leftElement.addEventListener('mousedown', this.mousedownOnLeftHandler);
    leftElement.addEventListener('mouseup', this.mouseupOnLeftHandler);
    leftElement.addEventListener('click', this.clickOnLeftHandler);
    leftElement.addEventListener('touchstart', this.touchstartOnLeftHandler, false);
    leftElement.addEventListener('touchend', this.touchendOnLeftHandler, false);

    const rightElement = this.rightImagePlaceholder.nativeElement as HTMLElement;
    rightElement.addEventListener('mousedown', this.mousedownOnRightHandler);
    rightElement.addEventListener('mouseup', this.mouseupOnRightHandler);
    rightElement.addEventListener('click', this.clickOnRightHandler);
    rightElement.addEventListener('touchstart', this.touchstartOnRightHandler, false);
    rightElement.addEventListener('touchend', this.touchendOnRightHandler, false);
  }

  private disableUserInteraction() {
    if (!this.leftImagePlaceholder || !this.rightImagePlaceholder) {
      return;
    }
    
    const leftElement = this.leftImagePlaceholder.nativeElement as HTMLElement;
    leftElement.removeEventListener('mousedown', this.mousedownOnLeftHandler);
    leftElement.removeEventListener('mouseup', this.mouseupOnLeftHandler);
    leftElement.removeEventListener('click', this.clickOnLeftHandler);
    leftElement.removeEventListener('touchstart', this.touchstartOnLeftHandler, false);
    leftElement.removeEventListener('touchend', this.touchendOnLeftHandler, false);


    const rightElement = this.rightImagePlaceholder.nativeElement as HTMLElement;
    rightElement.removeEventListener('mousedown', this.mousedownOnRightHandler);
    rightElement.removeEventListener('mouseup', this.mouseupOnRightHandler);
    rightElement.removeEventListener('click', this.clickOnRightHandler);
    rightElement.removeEventListener('touchstart', this.touchstartOnRightHandler, false);
    rightElement.removeEventListener('touchend', this.touchendOnRightHandler, false);
  }

  private startLeftSelection() {
    // start small timeout to enter selecting mode
    this.preSelectTimerId = window.setTimeout((which: Choice) => {
      this.startSelectionTimer(which);
    }, PRE_SELECT_TIMEOUT, Choice.Left);
  }

  private handleTouchStartOnLeft(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    
    this.startLeftSelection();
    this.leftTapTime = Date.now();
  }

  private handleTouchEndOnLeft(event: Event) {
    event.preventDefault();
    event.stopPropagation();

    this.startCancellingSelection();

    const tapTime = Date.now() - this.leftTapTime;
    if (tapTime <= TAP_TIMEOUT) {
      this.toggleAudioLeft();
    }
  }

  private handleTouchStartOnRight(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    
    this.startRightSelection();
    this.rightTapTime = Date.now();
  }

  private handleTouchEndOnRight(event: Event) {
    event.preventDefault();
    event.stopPropagation();

    this.startCancellingSelection();

    const tapTime = Date.now() - this.rightTapTime;
    if (tapTime <= TAP_TIMEOUT) {
      this.toggleAudioRight();
    }
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
        correct = this.game.answerQuestion(this.question!.iLeft);
        if (correct) {
          this.answered = Answer.CorrectLeft;
        } else {
          this.answered = Answer.WrongLeft;
        }
        break;
      
      case Choice.Right:
        correct = this.game.answerQuestion(this.question!.iRight);
        if (correct) {
          this.answered = Answer.CorrectRight;
        } else {
          this.answered = Answer.WrongRight;
        }
        break;
    }

    this.cancelSelection();

    // go to next question

    if (this.showAnswerTimerId) {
      window.clearTimeout(this.showAnswerTimerId);
    }

    this.showAnswerTimerId = window.setTimeout(() => {
      if (this.updateQuestion()) {
        this.updateResources();
        this.enableUserInteraction();
      }
    }, SHOW_ANSWER_TIMEOUT);
  }

  private updateQuestion() {
    if (this.game.isGameOver()) {
      this.gameIsOver = true;
      this.pauseAudio();
      return false;
    }

    this.answered = Answer.None;
    this.question = this.game.nextQuestion();

    return true;
  }

  private updateResources() {
    this.pauseAudio();
    this.addResources();
  }

  private pauseAudio() {
    // audio
    this.pauseAudioLeft();
    this.pauseAudioRight();
  }

  private addResources() {
    if (!this.question) {
      return;
    }

    // images 
    this.images = this.resourceManager.getImagesForQuestion(this.question);

    // audio
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
      const audioTrack = this.audio[0];

      if (audioTrack) {
        audioTrack.play();
      }

      this.leftAudioPlaying = true;
    } else {
      this.notificationService.notify({
        type: NotificationType.ERROR, 
        msg: 'Audio not available.',
        priority: NotificationPriority.IMMEDIATE
      });
    }
  }

  private pauseAudioLeft() {
    if (this.audio) {
      const audioTrack = this.audio[0];

      if (audioTrack) {
        audioTrack.pause();
      }

      this.leftAudioPlaying = false;
    }
  }

  private playAudioRight() {
    if (this.audio) {
      const audioTrack = this.audio[1];

      if (audioTrack) {
        audioTrack.play();
      }

      this.rightAudioPlaying = true;
    } else {
      this.notificationService.notify({
        type: NotificationType.ERROR, 
        msg: 'Audio not available.',
        priority: NotificationPriority.IMMEDIATE
      });
    }
  }

  private pauseAudioRight() {
    if (this.audio) {
      const audioTrack = this.audio[1];

      if (audioTrack) {
        audioTrack.pause();
      }

      this.rightAudioPlaying = false;
    }
  }

  onInfo() {
    this.notificationService.notify({
      type: NotificationType.INFO, 
      msg: 'Press and hold cover image to choose. Click/tap cover image to toggle audio.',
      priority: NotificationPriority.IMMEDIATE
    });
  }

}
