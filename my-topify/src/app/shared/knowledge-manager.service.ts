import { Injectable } from '@angular/core';
import { AppKnowledgeBase, Category, Item, ArtistKnowledgeBase, Artist, ImageURL, TrackKnowledgeBase, Track, Period } from './types';
import { Observable, forkJoin } from 'rxjs';
import { SpotifyPagingObject, SpotifyHttpClientService, SpotifyArtistObject, SpotifyTrackObject } from './spotify-http-client.service';
import { AuthService } from '../auth/auth.service';

@Injectable({providedIn: 'root'})
export class KnowledgeManagerService {

  knowledgeBase: AppKnowledgeBase = new AppKnowledgeBase();

  private fetchingKnowledge: Observable<boolean>;

  constructor(private auth: AuthService,
              private spotifyHttpClient: SpotifyHttpClientService) {
  }

  getKnowledgeBase(): AppKnowledgeBase {
    return this.knowledgeBase;
  }

  getArtistsFromPeriod(period: Period) {
    return this.knowledgeBase.getArtistsFromPeriod(period);
  } 

  getTracksFromPeriod(period: Period) {
    return this.knowledgeBase.getTracksFromPeriod(period);
  }

  fetchKnowledge(categories: Category[]): Observable<boolean> {
    const requests = [];
    const requestTypes: Category[] = [];

    for (const cat of categories) {
      if (this.knowledgeBase.hasKnowledge(cat)) {
        continue;
      }

      const request = this.spotifyHttpClient.getUserTop({
        accessToken: this.auth.getAccessToken(),
        category: cat
      });

      requests.push(request);
      requestTypes.push(cat);
    }

    this.fetchingKnowledge = new Observable((observer) => {
      if (requests.length === 0) {
        observer.next(true);
        return;
      }

      forkJoin(requests).subscribe(responseList => {
        for (let i = 0; i < responseList.length; ++i) {
          switch (requestTypes[i].type) {
            case Item.Artist:
              this.knowledgeBase.addArtistKnowledge(requestTypes[i].period, this.parseArtistRawData(responseList[i]));
              break;

            case Item.Track:
              this.knowledgeBase.addTrackKnowledge(requestTypes[i].period, this.parseTrackRawData(responseList[i]));
              break;
          }
        }

        observer.next(true);
      });
    });

    return this.fetchingKnowledge;
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
}
