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
  Track, 
  Category,
  Item} from 'src/app/shared/types';
import { forkJoin, Observable } from 'rxjs';

@Injectable({providedIn: 'root'})
export class GameConfiguratorService {

  private gameKnowledgeBase: GameKnowledgeBase = new GameKnowledgeBase();

  private configuringGame: Observable<boolean>;

  constructor(private auth: AuthService,
              private spotifyHttpClient: SpotifyHttpClientService) {
  }

  configureGame(config: GameConfiguration): Observable<boolean> {
    this.gameKnowledgeBase.gameConfiguration = config;

    const requests = [];
    const requestTypes: Category[] = [];

    
    if (this.gameKnowledgeBase.gameConfiguration.useArtists) {  
      if (!this.gameKnowledgeBase.artistKnowledgeBase) {
        this.gameKnowledgeBase.artistKnowledgeBase = new Map();
      }

      if (this.gameKnowledgeBase.gameConfiguration.useShortTermPeriod && 
          !this.gameKnowledgeBase.artistKnowledgeBase.has(Period.ShortTerm)) {
            
            const request = this.spotifyHttpClient.getUserTopArtists({
              accessToken: this.auth.getAccessToken(),
              period: Period.ShortTerm
            });

            requests.push(request);
            requestTypes.push({type: Item.Artist, period: Period.ShortTerm});
      }

      if (this.gameKnowledgeBase.gameConfiguration.useMediumTermPeriod && 
          !this.gameKnowledgeBase.artistKnowledgeBase.has(Period.MediumTerm)) {
          
            const request = this.spotifyHttpClient.getUserTopArtists({
              accessToken: this.auth.getAccessToken(),
              period: Period.MediumTerm
            });

            requests.push(request);
            requestTypes.push({type: Item.Artist, period: Period.MediumTerm});
      }

      if (this.gameKnowledgeBase.gameConfiguration.useLongTermPeriod && 
          !this.gameKnowledgeBase.artistKnowledgeBase.has(Period.LongTerm)) {
          
            const request = this.spotifyHttpClient.getUserTopArtists({
              accessToken: this.auth.getAccessToken(),
              period: Period.LongTerm
            });

            requests.push(request);
            requestTypes.push({type: Item.Artist, period: Period.LongTerm});
      }
    }

    if (this.gameKnowledgeBase.gameConfiguration.useTracks) {

      if (!this.gameKnowledgeBase.trackKnowledgeBase) {
        this.gameKnowledgeBase.trackKnowledgeBase = new Map();
      }

      if (this.gameKnowledgeBase.gameConfiguration.useShortTermPeriod &&
          !this.gameKnowledgeBase.trackKnowledgeBase.has(Period.ShortTerm)) {
            
            const request = this.spotifyHttpClient.getUserTopTracks({
              accessToken: this.auth.getAccessToken(),
              period: Period.ShortTerm
            });

            requests.push(request);
            requestTypes.push({type: Item.Track, period: Period.ShortTerm});
      }

      if (this.gameKnowledgeBase.gameConfiguration.useMediumTermPeriod &&
          !this.gameKnowledgeBase.trackKnowledgeBase.has(Period.MediumTerm)) {
          
            const request = this.spotifyHttpClient.getUserTopTracks({
              accessToken: this.auth.getAccessToken(),
              period: Period.MediumTerm
            });

            requests.push(request);
            requestTypes.push({type: Item.Track, period: Period.MediumTerm});
      }

      if (this.gameKnowledgeBase.gameConfiguration.useLongTermPeriod &&
          !this.gameKnowledgeBase.trackKnowledgeBase.has(Period.LongTerm)) {
          
            const request = this.spotifyHttpClient.getUserTopTracks({
              accessToken: this.auth.getAccessToken(),
              period: Period.LongTerm
            });

            requests.push(request);
            requestTypes.push({type: Item.Track, period: Period.LongTerm});
      }
    }

    this.configuringGame = new Observable((observer) => {
      if (requests.length === 0) {
        observer.next(true);
        return;
      }

      forkJoin(requests).subscribe(responseList => {
        for (let i = 0; i < responseList.length; ++i) {
          switch (requestTypes[i].type) {
            case Item.Artist: {
                const knowledgeBase = this.parseArtistRawData(responseList[i]);

                if (knowledgeBase) {
                  knowledgeBase.period = Period.ShortTerm;
                  this.gameKnowledgeBase.artistKnowledgeBase.set(requestTypes[i].period, knowledgeBase); 
                }
  
                break;
            }

            case Item.Track: {
              const knowledgeBase = this.parseTrackRawData(responseList[i]);

              if (knowledgeBase) {
                knowledgeBase.period = Period.ShortTerm;
                this.gameKnowledgeBase.trackKnowledgeBase.set(requestTypes[i].period, knowledgeBase); 
              }

              break;
            }
          }
        }

        observer.next(true);
      });
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

      const albumImages: ImageURL[] = [];

      for (const imageObj of trackItem.album.images) {
        albumImages.push({width: imageObj.width, height: imageObj.height, url: imageObj.url});
      }

      parsedTracks.push({
        id: trackItem.id, 
        name: trackItem.name,
        artists: trackArtists,
        album: {id: trackItem.album.id, name: trackItem.album.name, images: albumImages},
        previewURL: trackItem.preview_url});
    }

    return { period: undefined, size: parsedTracks.length, tracks: parsedTracks };
  }

  // TODO refactor
  // check at start which data needs to be collected and use operator to group results and fire at the end
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
