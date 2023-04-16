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
import { getArtistsShort, getTrackShortName } from './utility';


interface ImageResourceMetadata {
  urls: ImageURL[];
  rawWidth: number; // the width of the stored image
}

interface ImageResource {
  metadata: ImageResourceMetadata;
  data: HTMLImageElement;
}

interface AudioResourceMetadata {
  url: string;
}

interface AudioResource {
  metadata: AudioResourceMetadata;
  data: HTMLAudioElement;
}


@Injectable({providedIn: 'root'})
export class ResourceManagerService {
  private audioStorage: Map<Identifier, AudioResource> = new Map();
  private imageStorage: Map<Identifier, ImageResource> = new Map();

  private resourceReloadSubject = new Subject<void>();

  private readonly NO_IMG_AVAILABLE: HTMLImageElement;


  constructor(private screen: ScreenService) {
    // filler image to return in case of errors
    const defaultImageSize = screen.getImageSizeForGameView();
    this.NO_IMG_AVAILABLE = new Image(defaultImageSize, defaultImageSize);
    this.NO_IMG_AVAILABLE.style.display = 'block';
    this.NO_IMG_AVAILABLE.style.margin = '5px';
    this.NO_IMG_AVAILABLE.src = 'assets/images/no_img_available.jpg';

    this.screen.recommendedImgSizeChanged().subscribe(() => {
      this.refetchImages();

      // notify
      this.resourceReloadSubject.next();
    });
  }


  private refetchImages() {
    const desiredSize = this.screen.getImageSizeForGameView();

    this.imageStorage.forEach((imgResource, resourceId) => {
      if (imgResource.metadata.rawWidth >= desiredSize) {
        // don't get smaller sized images if we already have a larger version in storage
        imgResource.data.width = desiredSize;
        imgResource.data.height = desiredSize;
        return;
      }

      const newResource = 
        this.fetchImageResource(imgResource.metadata.urls, desiredSize, desiredSize);

      this.imageStorage.set(resourceId, newResource);
    });
  }


  /**
   * Get informed when resources have been reloaded
   */
  resourceReload() {
    return this.resourceReloadSubject.asObservable();
  }


  getImagesForQuestion(question: Question, knowledgeBase: GameKnowledgeBase): HTMLImageElement[] {
    const images = [];

    switch (question.category.type) {
      case Item.Artist: {}
        images.push(this.getImage(knowledgeBase.getArtist(question.category.period, question.iLeft)!));
        images.push(this.getImage(knowledgeBase.getArtist(question.category.period, question.iRight)!));
        
        break;

      case Item.Track:
        images.push(this.getImage(knowledgeBase.getTrack(question.category.period, question.iLeft)!));
        images.push(this.getImage(knowledgeBase.getTrack(question.category.period, question.iRight)!));
        
        break;
    }

    return images;
  }


  getAudioForQuestion(question: Question, knowledgeBase: GameKnowledgeBase): (HTMLAudioElement | undefined)[] | null {
    if (question.category.type === Item.Artist) {
      return null;
    }

    const audio: (HTMLAudioElement | undefined)[] = [];
    audio.push(this.getAudio(knowledgeBase.getTrack(question.category.period, question.iLeft)!));
    audio.push(this.getAudio(knowledgeBase.getTrack(question.category.period, question.iRight)!));

    return audio;
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
        text: {
          track: getTrackShortName(track.name), 
          artist: getArtistsShort(track.artists, 40), 
          album: track.album.name
        },
        knowledgeId: track.id
      });
    }

    return items;
  }


  private getImage(item: Artist | Track): HTMLImageElement {
    let img: ImageResource | undefined = undefined;

    if ('album' in item) {
      img = this.imageStorage.get(item.album.id); 
    } else {
      img = this.imageStorage.get(item.id);
    }

    if (img) {
      return img.data;
    } else {
      return this.NO_IMG_AVAILABLE;
    }
  }


  private getAudio(track: Track): HTMLAudioElement | undefined {
    const audio = this.audioStorage.get(track.id);

    if (audio) {
      return audio.data;
    } else {
      return undefined;
    }
  }


  fetchResourcesForGame(questions: Question[], knowledgeBase: GameKnowledgeBase) {
    for (const question of questions) {
      switch (question.category.type) {
        case Item.Artist:
          this.fetchResourcesForArtist(knowledgeBase.getArtist(question.category.period, question.iLeft)!);
          this.fetchResourcesForArtist(knowledgeBase.getArtist(question.category.period, question.iRight)!);
          break;

        case Item.Track:
          this.fetchResourcesForTrack(knowledgeBase.getTrack(question.category.period, question.iLeft)!);
          this.fetchResourcesForTrack(knowledgeBase.getTrack(question.category.period, question.iRight)!);
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


  private fetchResourcesForArtist(artist: Artist) {
    // image
    if (!this.imageStorage.has(artist.id)) {
      this.imageStorage.set(
        artist.id, 
        this.fetchImageResource(artist.images, this.screen.getImageSizeForGameView(), this.screen.getImageSizeForGameView())
      );
    }
  }


  private fetchResourcesForTrack(track: Track) {
    // image
    if (!this.imageStorage.has(track.album.id)) {
      this.imageStorage.set(
        track.album.id, 
        this.fetchImageResource(track.album.images, this.screen.getImageSizeForGameView(), this.screen.getImageSizeForGameView())
      );
    }

    // audio
    if (!this.audioStorage.has(track.id)) {
      if (!track.previewURL) {
        return;
      }

      this.audioStorage.set(
        track.id, 
        this.fetchAudioResource(track.previewURL)
      );
    }
  }


  private fetchImageResource(availableImages: ImageURL[], desiredWidth: number, desiredHeight: number): ImageResource {
    const imgElement = new Image(desiredWidth, desiredHeight);
    imgElement.style.display = 'block';
    imgElement.style.margin = '5px';

    let metadata: ImageResourceMetadata = {urls: [], rawWidth: desiredWidth};

    if (availableImages && availableImages.length > 0) {
      metadata.urls = availableImages;

      for (const image of availableImages) {
        imgElement.src = image.url;
        metadata.rawWidth = image.width;

        // select image that is "closest" to desired size
        // sufficient to choose based on width (all images seem to be square)
        if (image.width && image.width >= desiredWidth) {
          break;
        }
      }
    } else {
      // we don't have an img, return filler img
      imgElement.src = 'assets/images/no_img_available.jpg';
    }

    return {metadata, data: imgElement};

    // TODO? wait for image to load
    //img.onload  
  }


  private fetchAudioResource(url: string): AudioResource {
    const audio = new Audio(url);
    audio.loop = true;

    return {metadata: {url}, data: audio};

    // TODO? wait for audio to load
    //audio.addEventListener('canplaythrough', event => {
    //  console.log('can play!');
    //});
  }
}
