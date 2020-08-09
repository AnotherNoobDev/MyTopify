import { Injectable } from '@angular/core';
import { 
  SpotifyHttpClientService, 
  Period, 
  SpotifyPagingObject, 
  SpotifyArtistObject, 
  SpotifyTrackObject } from 'src/app/shared/spotify-http-client.service';
import { AuthService } from 'src/app/auth/auth.service';

export interface GameConfiguration {
  useTracks: boolean;
  useArtists: boolean;
  useShortTermPeriod: boolean;
  useMediumTermPeriod: boolean;
  useLongTermPeriod: boolean;
}

export interface ImageURL {
  width: number;
  height: number;
  url: string;
}

export type Identifier = string;

export interface Artist {
  id: Identifier;
  name: string;
  images: ImageURL[];
}

export interface ArtistKnowledgeBase {
  period: Period;
  size: number;
  artists: Artist[];
}

export interface Track {
  id: Identifier;
  name: string;
  artists: string[];
  album: string;
  images: ImageURL[];
  previewURL: string; // 30 seconds MP3
}

export interface TrackKnowledgeBase {
  period: Period;
  size: number;
  tracks: Track[];
} 

export class GameKnowledgeBase {
  gameConfiguration: GameConfiguration;
  artistKnowledgeBase: Map<Period, ArtistKnowledgeBase>;
  trackKnowledgeBase: Map<Period, TrackKnowledgeBase>;
}

@Injectable({providedIn: 'root'})
export class GameConfiguratorService {

  private gameKnowledgeBase: GameKnowledgeBase = new GameKnowledgeBase();

  constructor(private auth: AuthService,
              private spotifyHttpClient: SpotifyHttpClientService) {
  }

  configureGame(config: GameConfiguration) {
    this.gameKnowledgeBase.gameConfiguration = config;

    if (this.gameKnowledgeBase.gameConfiguration.useArtists) {
      this.gameKnowledgeBase.artistKnowledgeBase = new Map();

      if (this.gameKnowledgeBase.gameConfiguration.useShortTermPeriod) {
        this.spotifyHttpClient.getUserTopArtists({
          accessToken: this.auth.getAccessToken(),
          period: Period.ShortTerm})
            .subscribe(responseData => {
              const knowledgeBase =  this.parseArtistRawData(responseData);

              if (knowledgeBase) {
                knowledgeBase.period = Period.ShortTerm;
                this.gameKnowledgeBase.artistKnowledgeBase.set(Period.ShortTerm, knowledgeBase); 
              }
            });
      }

      if (this.gameKnowledgeBase.gameConfiguration.useMediumTermPeriod) {
        this.spotifyHttpClient.getUserTopArtists({
          accessToken: this.auth.getAccessToken(),
          period: Period.MediumTerm})
            .subscribe(responseData => {
              const knowledgeBase =  this.parseArtistRawData(responseData);

              if (knowledgeBase) {
                knowledgeBase.period = Period.MediumTerm;
                this.gameKnowledgeBase.artistKnowledgeBase.set(Period.MediumTerm, knowledgeBase); 
              }
            });
      }

      if (this.gameKnowledgeBase.gameConfiguration.useLongTermPeriod) {
        this.spotifyHttpClient.getUserTopArtists({
          accessToken: this.auth.getAccessToken(),
          period: Period.LongTerm})
            .subscribe(responseData => {
              const knowledgeBase =  this.parseArtistRawData(responseData);

              if (knowledgeBase) {
                knowledgeBase.period = Period.LongTerm;
                this.gameKnowledgeBase.artistKnowledgeBase.set(Period.LongTerm, knowledgeBase); 
              }
            });
      }
    }

    if (this.gameKnowledgeBase.gameConfiguration.useTracks) {
      this.gameKnowledgeBase.trackKnowledgeBase = new Map();

      if (this.gameKnowledgeBase.gameConfiguration.useShortTermPeriod) {
        this.spotifyHttpClient.getUserTopTracks({
          accessToken: this.auth.getAccessToken(),
          period: Period.ShortTerm})
            .subscribe(responseData => {
              const knowledgeBase =  this.parseTrackRawData(responseData);

              if (knowledgeBase) {
                knowledgeBase.period = Period.ShortTerm;
                this.gameKnowledgeBase.trackKnowledgeBase.set(Period.ShortTerm, knowledgeBase); 
              }
            });
      }

      if (this.gameKnowledgeBase.gameConfiguration.useMediumTermPeriod) {
        this.spotifyHttpClient.getUserTopTracks({
          accessToken: this.auth.getAccessToken(),
          period: Period.MediumTerm})
            .subscribe(responseData => {
              const knowledgeBase =  this.parseTrackRawData(responseData);

              if (knowledgeBase) {
                knowledgeBase.period = Period.MediumTerm;
                this.gameKnowledgeBase.trackKnowledgeBase.set(Period.MediumTerm, knowledgeBase); 
              }
            });
      }

      if (this.gameKnowledgeBase.gameConfiguration.useLongTermPeriod) {
        this.spotifyHttpClient.getUserTopTracks({
          accessToken: this.auth.getAccessToken(),
          period: Period.LongTerm})
            .subscribe(responseData => {
              const knowledgeBase =  this.parseTrackRawData(responseData);

              if (knowledgeBase) {
                knowledgeBase.period = Period.LongTerm;
                this.gameKnowledgeBase.trackKnowledgeBase.set(Period.LongTerm, knowledgeBase); 
              }
            });
      }
    }

    console.log(this.gameKnowledgeBase);
  }

  private parseArtistRawData(data: SpotifyPagingObject): ArtistKnowledgeBase {
    const parsedArtists: Artist[] = [];

    for (const item of data.items) {
      const artistItem = item as SpotifyArtistObject;

      const artistImages: ImageURL[] = [];

      for (const imageObj of artistItem.images) {
        artistImages.push({width: imageObj.width, height: imageObj.height, url: imageObj.url});
      }

      parsedArtists.push({id: artistItem.id, name: artistItem.name, images: artistImages});
    }

    return { period: undefined, size: parsedArtists.length, artists: parsedArtists };
  }

  private parseTrackRawData(data: SpotifyPagingObject): TrackKnowledgeBase {
    const parsedTracks: Track[] = [];

    for (const item of data.items) {
      const trackItem = item as SpotifyTrackObject;

      const trackArtists: string[] = [];

      for (const artistObj of trackItem.artists) {
        trackArtists.push(artistObj.name);
      }

      const trackImages: ImageURL[] = [];

      for (const imageObj of trackItem.album.images) {
        trackImages.push({width: imageObj.width, height: imageObj.height, url: imageObj.url});
      }

      parsedTracks.push({
        id: trackItem.id, 
        name: trackItem.name,
        artists: trackArtists,
        album: trackItem.album.name,
        images: trackImages,
        previewURL: trackItem.previewURL});
    }

    return { period: undefined, size: parsedTracks.length, tracks: parsedTracks };
  }
}
