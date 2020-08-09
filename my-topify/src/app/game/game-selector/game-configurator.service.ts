import { Injectable } from '@angular/core';
import { SpotifyHttpClientService } from 'src/app/shared/spotify-http-client.service';

export interface GameConfiguration {
  useTracks: boolean;
  useArtists: boolean;
  useShortTermPeriod: boolean;
  useMediumTermPeriod: boolean;
  useLongTermPeriod: boolean;
}

@Injectable({providedIn: 'root'})
export class GameConfiguratorService {

  private gameConfig: GameConfiguration;

  constructor(private spotifyHttpClient: SpotifyHttpClientService) {

  }

  configureGame(config: GameConfiguration) {
    this.gameConfig = config;

    console.log(this.gameConfig);
    // TODO fetch data based on config
  }
}
