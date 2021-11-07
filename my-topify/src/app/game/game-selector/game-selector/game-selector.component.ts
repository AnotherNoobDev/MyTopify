/*
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { GameConfiguratorService } from '../game-configurator.service';
import { QuestionGeneratorService } from '../../question-generator.service';
import { Router } from '@angular/router';
import { GameService } from '../../game.service';
import { Subscription } from 'rxjs';
import { ResourceManagerService } from 'src/app/shared/resource-manager.service';
import { NotificationPriority, NotificationsService, NotificationType } from 'notifications-lib';


interface GameSelectionFormValue {
  type_tracks: boolean;
  type_artists: boolean;

  period_short_term: boolean;
  period_medium_term: boolean;
  period_long_term: boolean;
}

@Component({
  selector: 'app-game-selector',
  templateUrl: './game-selector.component.html',
  styleUrls: ['../../../shared/style/common.css', './game-selector.component.css']
})
export class GameSelectorComponent implements OnInit, OnDestroy {

  public useTypeArtists = true;
  public useTypeTracks = true;

  public useShortTermPeriod = true;
  public useMediumTermPeriod = true;
  public useLongTermPeriod = true;

  private configuringGameSub: Subscription | undefined = undefined;

  constructor(private gameConfigurator: GameConfiguratorService,
              private questionGenerator: QuestionGeneratorService,
              private game: GameService,
              private resourceManager: ResourceManagerService,
              private router: Router,
              private notificationManager: NotificationsService) { }

  ngOnInit() {
  }

  ngOnDestroy() {
    if (this.configuringGameSub) {
      this.configuringGameSub.unsubscribe();
    }
  }

  onTypeSelected(form: NgForm) {
    const val = form.value as GameSelectionFormValue;

    // at least one checkbox must be selected
    if (!val.type_tracks && !val.type_artists) {
      if (!this.useTypeArtists) {
        this.useTypeArtists = true;
        this.useTypeTracks = false;
      } else {
        this.useTypeArtists = false;
        this.useTypeTracks = true;
      }
    } else {
      this.useTypeArtists = val.type_artists;
      this.useTypeTracks = val.type_tracks;
    }
  }

  onPeriodSelected(form: NgForm) {
    const val = form.value as GameSelectionFormValue;

    // at least one checkbox must be selected
    if (!val.period_short_term &&
        !val.period_medium_term &&
        !val.period_long_term) {
          if (!this.useShortTermPeriod) {
            this.useShortTermPeriod = true;
            this.useMediumTermPeriod = false;
            this.useLongTermPeriod = false;
          } else if (!this.useMediumTermPeriod) {
            this.useShortTermPeriod = false;
            this.useMediumTermPeriod = true;
            this.useLongTermPeriod = false;
          } else {
            this.useShortTermPeriod = false;
            this.useMediumTermPeriod = false;
            this.useLongTermPeriod = true;
          }
        } else {
          this.useShortTermPeriod = val.period_short_term;
          this.useMediumTermPeriod = val.period_medium_term;
          this.useLongTermPeriod = val.period_long_term;
        }
  }

  onStartGame(form: NgForm) {
    if (this.configuringGameSub) {
      this.configuringGameSub.unsubscribe();
    }

    const val = form.value as GameSelectionFormValue;

    this.configuringGameSub = this.gameConfigurator.configureGame({
      useTracks: val.type_tracks,
      useArtists: val.type_artists,
      useShortTermPeriod: val.period_short_term,
      useMediumTermPeriod: val.period_medium_term,
      useLongTermPeriod: val.period_long_term
    }).subscribe(kbGame => {
      if (!kbGame) {
        this.notificationManager.notify({
          type: NotificationType.ERROR, 
          msg: 'Failed to retrieve data from Spotify.',
          priority: NotificationPriority.STANDARD
        });
        return;
      }

      this.game.setKnowledgeBase(kbGame);
      
      const questions = this.questionGenerator.generateQuestions(kbGame);

      if (!questions) {
        this.notificationManager.notify({
          type: NotificationType.ERROR, 
          msg: 'Not enough Spotify History to play :(',
          priority: NotificationPriority.STANDARD
        });
        return;
      }

      this.game.setQuestions(questions);

      this.game.restart();

      // start resource fetching
      // TODO? wait until some data is ready (show loading)
      this.resourceManager.fetchResourcesForGame(questions, kbGame);

      // navigate to game-loop
      this.router.navigate(['game/main']);
    });
  }

}
