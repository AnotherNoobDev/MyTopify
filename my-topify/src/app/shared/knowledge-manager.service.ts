/*
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import { Injectable } from '@angular/core';
import { AppKnowledgeBase, ArtistKnowledgeBase, TrackKnowledgeBase } from './types';
import { Observable, forkJoin } from 'rxjs';
import { 
  Category, Item, Artist, ImageURL, Track, Period,
  SpotifyPagingObject, 
  SpotifyHttpClientService, 
  SpotifyArtistObject, 
  SpotifyTrackObject,
  AuthService } from 'spotify-lib';
import { ScreenService } from './screen.service';


@Injectable({providedIn: 'root'})
export class KnowledgeManagerService {

  knowledgeBase: AppKnowledgeBase = new AppKnowledgeBase();

  private fetchingKnowledge: Observable<boolean> | undefined;


  constructor(private auth: AuthService,
              private spotifyHttpClient: SpotifyHttpClientService,
              private screen: ScreenService) {
  }


  getKnowledgeBase(): AppKnowledgeBase {
    return this.knowledgeBase;
  }


  getArtistsFromPeriod(period: Period): ArtistKnowledgeBase {
    return this.knowledgeBase.getArtistsFromPeriod(period);
  } 


  getTracksFromPeriod(period: Period): TrackKnowledgeBase {
    return this.knowledgeBase.getTracksFromPeriod(period);
  }


  fetchKnowledge(categories: Category[]): Observable<boolean> {
    // setup the requests we will be making for user's top artists/tracks
    const requests: Observable<SpotifyPagingObject>[] = [];
    const requestTypes: Category[] = [];

    for (const cat of categories) {
      if (this.knowledgeBase.hasKnowledge(cat)) {
        // don't make requests for data we already have
        continue;
      }

      const request = this.spotifyHttpClient.getUserTop({
        accessToken: this.auth.getAccessToken(),
        category: cat
      });

      requests.push(request);
      requestTypes.push(cat);
    }

    // make requests
    this.fetchingKnowledge = new Observable((observer) => {
      if (requests.length === 0) {
        observer.next(true);
        return;
      }

      forkJoin(requests).subscribe(
        responseList => {
          for (let i = 0; i < responseList.length; ++i) {
            switch (requestTypes[i].type) {
              case Item.Artist:
                this.knowledgeBase.addArtistKnowledge(
                  requestTypes[i].period, 
                  this.parseArtistRawData(requestTypes[i].period, responseList[i])
                );
                
                break;

              case Item.Track:
                this.knowledgeBase.addTrackKnowledge(
                  requestTypes[i].period, 
                  this.parseTrackRawData(requestTypes[i].period, responseList[i])
                );

                break;
            }
          }

          observer.next(true);
        },
        err => {
          observer.next(false);
        }
      );
    });

    return this.fetchingKnowledge;
  }


  private parseArtistRawData(period: Period, data: SpotifyPagingObject): ArtistKnowledgeBase {
    const parsedArtists: Artist[] = [];

    const defaultImageSize = this.screen.getImageSizeForGameView();

    for (const item of data.items) {
      const artistItem = item as SpotifyArtistObject;

      const artistImages: ImageURL[] = [];

      for (const imageObj of artistItem.images) {
        artistImages.push({
          width: imageObj.width? imageObj.width : defaultImageSize, 
          height: imageObj.height? imageObj.height : defaultImageSize, 
          url: imageObj.url
        });
      }

      parsedArtists.push({id: artistItem.id, name: artistItem.name, images: this.sortImageURL(artistImages)});
    }

    return { period, artists: parsedArtists };
  }


  private parseTrackRawData(period: Period, data: SpotifyPagingObject): TrackKnowledgeBase {
    const parsedTracks: Track[] = [];

    const defaultImageSize = this.screen.getImageSizeForGameView();

    for (const item of data.items) {
      const trackItem = item as SpotifyTrackObject;

      const trackArtists: string[] = [];

      for (const artistObj of trackItem.artists) {
        trackArtists.push(artistObj.name);
      }

      const albumImages: ImageURL[] = [];

      for (const imageObj of trackItem.album.images) {
        albumImages.push({
          width: imageObj.width? imageObj.width : defaultImageSize, 
          height: imageObj.height? imageObj.height : defaultImageSize, 
          url: imageObj.url
        });
      }

      parsedTracks.push({
        id: trackItem.id, 
        name: trackItem.name,
        artists: trackArtists,
        album: {id: trackItem.album.id, name: trackItem.album.name, images: this.sortImageURL(albumImages)},
        previewURL: trackItem.preview_url
      });
    }

    return { period, tracks: parsedTracks };
  }

  /**
   * ascending, by width 
   */
  private sortImageURL(data: ImageURL[]) {
    return data.sort((left: ImageURL, right: ImageURL) => {
      return left.width - right.width;
    });
  }
}
