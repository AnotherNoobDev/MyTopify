import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { GameConfiguratorService } from '../game-configurator.service';

@Component({
  selector: 'app-game-selector',
  templateUrl: './game-selector.component.html',
  styleUrls: ['./game-selector.component.css']
})
export class GameSelectorComponent implements OnInit {

  private useTypeArtists = true;
  private useTypeTracks = true;

  private useShortTermPeriod = true;
  private useMediumTermPeriod = true;
  private useLongTermPeriod = true;

  constructor(private gameConfigurator: GameConfiguratorService) { }

  ngOnInit() {
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
    this.gameConfigurator.configureGame({
      useTracks: form.value.type_tracks,
      useArtists: form.value.type_artists,
      useShortTermPeriod: form.value.period_short_term,
      useMediumTermPeriod: form.value.period_medium_term,
      useLongTermPeriod: form.value.period_long_term
    });

    // TODO navigate to game-loop page once game has been configured
  }

}
