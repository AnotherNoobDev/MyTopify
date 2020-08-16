import { Injectable } from '@angular/core';
import { 
  SpotifyHttpClientService, 
  SpotifyPagingObject, 
  SpotifyArtistObject, 
  SpotifyTrackObject } from 'src/app/shared/spotify-http-client.service';
import { AuthService } from 'src/app/auth/auth.service';
import { 
  Period, 
  GameKnowledgeBase, 
  GameConfiguration, 
  ArtistKnowledgeBase, 
  Artist, 
  ImageURL, 
  TrackKnowledgeBase, 
  Track } from 'src/app/shared/types';
import { Observable } from 'rxjs';

@Injectable({providedIn: 'root'})
export class GameConfiguratorService {

  private gameKnowledgeBase: GameKnowledgeBase = new GameKnowledgeBase();

  private configuringGame: Observable<boolean>;

  constructor(private auth: AuthService,
              private spotifyHttpClient: SpotifyHttpClientService) {
  }

  configureGame(config: GameConfiguration): Observable<boolean> {
    this.configuringGame = new Observable((observer) => {
      this.gameKnowledgeBase.gameConfiguration = config;

      if (this.gameKnowledgeBase.gameConfiguration.useArtists) {  
        
        if (!this.gameKnowledgeBase.artistKnowledgeBase) {
          this.gameKnowledgeBase.artistKnowledgeBase = new Map();
        }

        if (this.gameKnowledgeBase.gameConfiguration.useShortTermPeriod) {
          if (this.gameKnowledgeBase.artistKnowledgeBase.has(Period.ShortTerm)) {
            if (this.dataRetrieved()) {
              observer.next(true);
            }
          } else {
            this.spotifyHttpClient.getUserTopArtists({
              accessToken: this.auth.getAccessToken(),
              period: Period.ShortTerm})
                .subscribe(responseData => {
                  const knowledgeBase =  this.parseArtistRawData(responseData);
  
                  if (knowledgeBase) {
                    knowledgeBase.period = Period.ShortTerm;
                    this.gameKnowledgeBase.artistKnowledgeBase.set(Period.ShortTerm, knowledgeBase); 
                  }
  
                  if (this.dataRetrieved()) {
                    observer.next(true);
                  }
                });
          }
        }

        if (this.gameKnowledgeBase.gameConfiguration.useMediumTermPeriod) {
          if (this.gameKnowledgeBase.artistKnowledgeBase.has(Period.MediumTerm)) {
            if (this.dataRetrieved()) {
              observer.next(true);
            }
          } else {
            this.spotifyHttpClient.getUserTopArtists({
              accessToken: this.auth.getAccessToken(),
              period: Period.MediumTerm})
                .subscribe(responseData => {
                  const knowledgeBase =  this.parseArtistRawData(responseData);
  
                  if (knowledgeBase) {
                    knowledgeBase.period = Period.MediumTerm;
                    this.gameKnowledgeBase.artistKnowledgeBase.set(Period.MediumTerm, knowledgeBase); 
                  }
  
                  if (this.dataRetrieved()) {
                    observer.next(true);
                  }
                });
          }
        }

        if (this.gameKnowledgeBase.gameConfiguration.useLongTermPeriod) {
          if (this.gameKnowledgeBase.artistKnowledgeBase.has(Period.LongTerm)) {
            if (this.dataRetrieved()) {
              observer.next(true);
            }
          } else {
            this.spotifyHttpClient.getUserTopArtists({
              accessToken: this.auth.getAccessToken(),
              period: Period.LongTerm})
                .subscribe(responseData => {
                  const knowledgeBase =  this.parseArtistRawData(responseData);
  
                  if (knowledgeBase) {
                    knowledgeBase.period = Period.LongTerm;
                    this.gameKnowledgeBase.artistKnowledgeBase.set(Period.LongTerm, knowledgeBase); 
                  }
  
                  if (this.dataRetrieved()) {
                    observer.next(true);
                  }
                });
          }
        }
      }

      if (this.gameKnowledgeBase.gameConfiguration.useTracks) {

        if (!this.gameKnowledgeBase.trackKnowledgeBase) {
          this.gameKnowledgeBase.trackKnowledgeBase = new Map();
        }

        if (this.gameKnowledgeBase.gameConfiguration.useShortTermPeriod) {
          if (this.gameKnowledgeBase.trackKnowledgeBase.has(Period.ShortTerm)) {
            if (this.dataRetrieved()) {
              observer.next(true);
            }
          } else {
            this.spotifyHttpClient.getUserTopTracks({
              accessToken: this.auth.getAccessToken(),
              period: Period.ShortTerm})
                .subscribe(responseData => {
                  const knowledgeBase =  this.parseTrackRawData(responseData);
  
                  if (knowledgeBase) {
                    knowledgeBase.period = Period.ShortTerm;
                    this.gameKnowledgeBase.trackKnowledgeBase.set(Period.ShortTerm, knowledgeBase); 
                  }
  
                  if (this.dataRetrieved()) {
                    observer.next(true);
                  }
                });
          }
        }

        if (this.gameKnowledgeBase.gameConfiguration.useMediumTermPeriod) {
          if (this.gameKnowledgeBase.trackKnowledgeBase.has(Period.MediumTerm)) {
            if (this.dataRetrieved()) {
              observer.next(true);
            }
          } else {
            this.spotifyHttpClient.getUserTopTracks({
              accessToken: this.auth.getAccessToken(),
              period: Period.MediumTerm})
                .subscribe(responseData => {
                  const knowledgeBase =  this.parseTrackRawData(responseData);
  
                  if (knowledgeBase) {
                    knowledgeBase.period = Period.MediumTerm;
                    this.gameKnowledgeBase.trackKnowledgeBase.set(Period.MediumTerm, knowledgeBase); 
                  }
  
                  if (this.dataRetrieved()) {
                    observer.next(true);
                  }
                });
          }
        }

        if (this.gameKnowledgeBase.gameConfiguration.useLongTermPeriod) { 
          if (this.gameKnowledgeBase.trackKnowledgeBase.has(Period.LongTerm)) {
            if (this.dataRetrieved()) {
              observer.next(true);
            }
          } else {
            this.spotifyHttpClient.getUserTopTracks({
              accessToken: this.auth.getAccessToken(),
              period: Period.LongTerm})
                .subscribe(responseData => {
                  const knowledgeBase =  this.parseTrackRawData(responseData);
  
                  if (knowledgeBase) {
                    knowledgeBase.period = Period.LongTerm;
                    this.gameKnowledgeBase.trackKnowledgeBase.set(Period.LongTerm, knowledgeBase); 
                  }
  
                  if (this.dataRetrieved()) {
                    observer.next(true);
                  }
                });
          }
        }
      }
    });

    return this.configuringGame;
  }

  getKnowledgeBase(): GameKnowledgeBase {
    return this.gameKnowledgeBase;
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
        previewURL: trackItem.preview_url});
    }

    return { period: undefined, size: parsedTracks.length, tracks: parsedTracks };
  }

  // TODO refactor --> only fire once
  private dataRetrieved(): boolean {
    if (this.gameKnowledgeBase.gameConfiguration.useArtists) {
      if (!this.gameKnowledgeBase.artistKnowledgeBase) {
        return false;
      }

      if (this.gameKnowledgeBase.gameConfiguration.useShortTermPeriod) {
        if (!this.gameKnowledgeBase.artistKnowledgeBase.has(Period.ShortTerm)) {
          return false;
        }
      }

      if (this.gameKnowledgeBase.gameConfiguration.useMediumTermPeriod) {
        if (!this.gameKnowledgeBase.artistKnowledgeBase.has(Period.MediumTerm)) {
          return false;
        }
      }

      if (this.gameKnowledgeBase.gameConfiguration.useLongTermPeriod) {
        if (!this.gameKnowledgeBase.artistKnowledgeBase.has(Period.LongTerm)) {
          return false;
        }
      }
    }

    if (this.gameKnowledgeBase.gameConfiguration.useTracks) {
      if (!this.gameKnowledgeBase.trackKnowledgeBase) {
        return false;
      }

      if (this.gameKnowledgeBase.gameConfiguration.useShortTermPeriod) {
        if (!this.gameKnowledgeBase.trackKnowledgeBase.has(Period.ShortTerm)) {
          return false;
        }
      }

      if (this.gameKnowledgeBase.gameConfiguration.useMediumTermPeriod) {
        if (!this.gameKnowledgeBase.trackKnowledgeBase.has(Period.MediumTerm)) {
          return false;
        }
      }

      if (this.gameKnowledgeBase.gameConfiguration.useLongTermPeriod) {
        if (!this.gameKnowledgeBase.trackKnowledgeBase.has(Period.LongTerm)) {
          return false;
        }
      }
    }
   
    return true;
  }

}
