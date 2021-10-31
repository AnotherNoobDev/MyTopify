/*
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import { Injectable } from '@angular/core';
import {
  Identifier,
  Item, Artist, Track, 
  ImageURL
} from 'spotify-lib'
import { 
  GameKnowledgeBase, 
  Question, 
  ArtistKnowledgeBase, TrackKnowledgeBase, 
  DisplayableItem } from './types';
import { ScreenService } from './screen.service';
import { Subject } from 'rxjs';
import { getTrackShortName } from './utility';

@Injectable({providedIn: 'root'})
export class ResourceManagerService {
  private knowledgeBase: GameKnowledgeBase | undefined = undefined;
  private gameQuestions: Question[] | undefined = undefined;

  private audioStorage: Map<Identifier, HTMLAudioElement> = new Map();
  private imageStorage: Map<Identifier, HTMLImageElement> = new Map();

  private resourceReloadSubject = new Subject<void>();

  private readonly NO_IMG_AVAILABLE: HTMLImageElement;

  constructor(private screen: ScreenService) {
    // filler image to return in case of errors
    this.NO_IMG_AVAILABLE = new Image(320, 320);
    this.NO_IMG_AVAILABLE.style.display = 'block';
    this.NO_IMG_AVAILABLE.style.margin = '5px';
    this.NO_IMG_AVAILABLE.src = 'assets/images/no_img_available.jpg';

    this.screen.recommendedImgSizeChanged().subscribe(() => {
      // invalidate images
      this.imageStorage.clear();

      // refetch using the knowledge base
      if (this.knowledgeBase && this.gameQuestions) {
        this.fetchResourcesForGame(this.gameQuestions, this.knowledgeBase);
      }
      // notify
      this.resourceReloadSubject.next();
    });
  }

  resourceReload() {
    return this.resourceReloadSubject.asObservable();
  }

  getImagesForQuestion(question: Question): HTMLImageElement[] {
    if (!this.knowledgeBase) {
      return [this.NO_IMG_AVAILABLE, this.NO_IMG_AVAILABLE];
    }

    const images = [];

    switch (question.category.type) {
      case Item.Artist: {}
        images.push(this.getImage(this.knowledgeBase.getArtist(question.category.period, question.iLeft)));
        images.push(this.getImage(this.knowledgeBase.getArtist(question.category.period, question.iRight)));
        
        break;

      case Item.Track:
        images.push(this.getImage(this.knowledgeBase.getTrack(question.category.period, question.iLeft)));
        images.push(this.getImage(this.knowledgeBase.getTrack(question.category.period, question.iRight)));
        
        break;
    }

    return images;
  }

  getAudioForQuestion(question: Question): (HTMLAudioElement | undefined)[] | null {
    if (question.category.type === Item.Artist) {
      return null;
    }

    if (!this.knowledgeBase) {
      return null;
    }

    const audio: (HTMLAudioElement | undefined)[] = [];
    audio.push(this.getAudio(this.knowledgeBase.getTrack(question.category.period, question.iLeft)));
    audio.push(this.getAudio(this.knowledgeBase.getTrack(question.category.period, question.iRight)));

    return audio;
  }

  private getImage(item: Artist | Track | undefined | null): HTMLImageElement {
    if (!item) {
      return this.NO_IMG_AVAILABLE;
    }

    let img = undefined;
    if ('album' in item) {
      img = this.imageStorage.get(item.album.id); 
    } else {
      img = this.imageStorage.get(item.id);
    }

    if (img) {
      return img;
    } else {
      return this.NO_IMG_AVAILABLE;
    }
  }

  private getAudio(track: Track | undefined | null): HTMLAudioElement | undefined {
    if (!track) {
      return;
    }

    return this.audioStorage.get(track.id);
  }

  getArtistsAsDisplayableItems(knowledgeBase: ArtistKnowledgeBase): DisplayableItem[] {
    const items: DisplayableItem[] = [];

    for (const artist of knowledgeBase.artists) {
      items.push({
        image: this.getImage(artist),
        audio: undefined,
        text: {track: '', artist: artist.name, album: ''},
        knowledgeId: artist.id
      });
    }

    return items;
  }

  getTracksAsDisplayableItems(knowledgeBase: TrackKnowledgeBase): DisplayableItem[] {
    const items: DisplayableItem[] = [];

    for (const track of knowledgeBase.tracks) {
      items.push({
        image: this.getImage(track),
        audio: this.getAudio(track),
        text: {track: getTrackShortName(track.name), artist: track.artists.join(', '), album: track.album.name},
        knowledgeId: track.id
      });
    }

    return items;
  }

  fetchResourcesForGame(questions: Question[], knowledgeBase: GameKnowledgeBase) {
    this.knowledgeBase = knowledgeBase;
    this.gameQuestions = questions;

    for (const question of questions) {
      switch (question.category.type) {
        case Item.Artist:
          this.fetchResourcesForArtist(knowledgeBase.getArtist(question.category.period, question.iLeft));
          this.fetchResourcesForArtist(knowledgeBase.getArtist(question.category.period, question.iRight));
          break;

        case Item.Track:
          this.fetchResourcesForTrack(knowledgeBase.getTrack(question.category.period, question.iLeft));
          this.fetchResourcesForTrack(knowledgeBase.getTrack(question.category.period, question.iRight));
          break;
      }
    }
  }

  fetchResourcesForArtists(knowledgeBase: ArtistKnowledgeBase) {
    for (const artist of knowledgeBase.artists) {
      this.fetchResourcesForArtist(artist);
    }
  }

  fetchResourcesForTracks(knowledgeBase: TrackKnowledgeBase) {
    for (const track of knowledgeBase.tracks) {
      this.fetchResourcesForTrack(track);
    }
  }

  private fetchResourcesForArtist(artist: Artist | undefined | null) {
    if (!artist) {
      return;
    }

    if (this.imageStorage.has(artist.id)) {
      return;
    }

    this.imageStorage.set(artist.id, 
      this.fetchImage(artist.images, this.screen.getImageSizeForGameView(), this.screen.getImageSizeForGameView()));
  }

  private fetchResourcesForTrack(track: Track | undefined | null) {
    if (!track) {
      return;
    }

    // image
    if (!this.imageStorage.has(track.album.id)) {
      this.imageStorage.set(track.album.id, 
        this.fetchImage(track.album.images, this.screen.getImageSizeForGameView(), this.screen.getImageSizeForGameView()));
    }

    // audio
    if (!this.audioStorage.has(track.id)) {
      const audio = this.fetchAudio(track.previewURL);

      if (audio) {
        this.audioStorage.set(track.id, audio);
      }
    }
  }

  private fetchImage(availableImages: ImageURL[], desiredWidth: number, desiredHeight: number): HTMLImageElement {
    const img = new Image(desiredWidth, desiredHeight);
    img.style.display = 'block';
    img.style.margin = '5px';

    if (availableImages && availableImages.length > 0) {
      // TODO? wait for image to preload
      //img.onload
      
      for (const image of availableImages) {
        img.src = image.url;
      
        // select image that is "closest" to desired size
        if (image.width && image.width >= desiredWidth) {
          break;
        }
      }
    } else {
      // filler img
      img.src = 'assets/images/no_img_available.jpg';
    }


    return img;
  }

  private fetchAudio(url: string): HTMLAudioElement | null {
    if (url) {
      const audio = new Audio(url);
      audio.loop = true;
      return audio;
    }

    return null;

    // TODO? wait for audio to preload
    //audio.addEventListener('canplaythrough', event => {
    //  console.log('can play!');
    //});
  }
}
