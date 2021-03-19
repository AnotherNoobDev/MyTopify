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
import { NotificationsService, NotificationType } from 'notifications-lib';

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

  private configuringGameSub: Subscription;

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
    // at least one checkbox must be selected
    if (!form.value.type_tracks && !form.value.type_artists) {
      if (!this.useTypeArtists) {
        this.useTypeArtists = true;
        this.useTypeTracks = false;
      } else {
        this.useTypeArtists = false;
        this.useTypeTracks = true;
      }
    } else {
      this.useTypeArtists = form.value.type_artists;
      this.useTypeTracks = form.value.type_tracks;
    }
  }

  onPeriodSelected(form: NgForm) {
    // at least one checkbox must be selected
    if (!form.value.period_short_term &&
        !form.value.period_medium_term &&
        !form.value.period_long_term) {
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
          this.useShortTermPeriod = form.value.period_short_term;
          this.useMediumTermPeriod = form.value.period_medium_term;
          this.useLongTermPeriod = form.value.period_long_term;
        }
  }

  onStartGame(form: NgForm) {
    if (this.configuringGameSub) {
      this.configuringGameSub.unsubscribe();
    }

    this.configuringGameSub = this.gameConfigurator.configureGame({
      useTracks: form.value.type_tracks,
      useArtists: form.value.type_artists,
      useShortTermPeriod: form.value.period_short_term,
      useMediumTermPeriod: form.value.period_medium_term,
      useLongTermPeriod: form.value.period_long_term
    }).subscribe(success => {

      if (!success) {
        this.notificationManager.notify({type: NotificationType.ERROR, msg: 'Failed to retrieve data from Spotify.'});
        return;
      }

      const kb = this.gameConfigurator.getKnowledgeBase();
      this.game.setKnowledgeBase(kb);
      
      const questions = this.questionGenerator.generateQuestions(kb);

      if (!questions) {
        this.notificationManager.notify({type: NotificationType.ERROR, msg: 'Not enough Spotify History to play :('});
        return;
      }

      this.game.setQuestions(questions);

      this.game.restart();

      // start resource fetching
      // TODO? wait until some data is ready (show loading)
      this.resourceManager.fetchResourcesForGame(questions, kb);

      // navigate to game-loop
      this.router.navigate(['game/main']);
    });
  }

}
