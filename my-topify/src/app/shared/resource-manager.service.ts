import { Injectable } from '@angular/core';
import { Identifier, GameKnowledgeBase, Question, Item, Artist, Track, ImageURL } from './types';
import { ScreenService } from './screen.service';

@Injectable({providedIn: 'root'})
export class ResourceManagerService {
  private knowledgeBase: GameKnowledgeBase;
  private audioStorage: Map<Identifier, HTMLAudioElement> = new Map();
  private imageStorage: Map<Identifier, HTMLImageElement> = new Map();

  constructor(private screen: ScreenService) {
  }

  getImagesForQuestion(question: Question): HTMLImageElement[] {
    const images = [];

    switch (question.category.type) {
      case Item.Artist:
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

  getAudioForQuestion(question: Question): HTMLAudioElement[] {
    if (question.category.type === Item.Artist) {
      return null;
    }

    const audio = [];

    audio.push(this.getAudio(this.knowledgeBase.getTrack(question.category.period, question.iLeft)));
    audio.push(this.getAudio(this.knowledgeBase.getTrack(question.category.period, question.iRight)));

    return audio;
  }

  getImage(item: Artist | Track) {
    return this.imageStorage.get(item.id);
  }

  getAudio(track: Track) {
    return this.audioStorage.get(track.id);
  }

  fetchResourcesForGame(questions: Question[], knowledgeBase: GameKnowledgeBase) {
    this.knowledgeBase = knowledgeBase;

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

  fetchResourcesForArtist(artist: Artist) {
    if (this.imageStorage.has(artist.id)) {
      return;
    }

    // TODO do we want to store multiple images?
    this.imageStorage.set(artist.id, 
      this.fetchImage(artist.images, this.screen.getImageSizeForGameView(), this.screen.getImageSizeForGameView()));
  }

  fetchResourcesForTrack(track: Track) {
    // image
    if (!this.imageStorage.has(track.id)) {
      // TODO do we want to store multiple images?
      // TODO some tracks could have the same cover (use album id as key)!!
      this.imageStorage.set(track.id, 
        this.fetchImage(track.images, this.screen.getImageSizeForGameView(), this.screen.getImageSizeForGameView()));
    }

    // audio
    if (!this.audioStorage.has(track.id)) {
      this.audioStorage.set(track.id, this.fetchAudio(track.previewURL));
    }
  }

  private fetchImage(availableImages: ImageURL[], desiredWidth: number, desiredHeight: number): HTMLImageElement {
    const img = new Image(desiredWidth, desiredHeight);
    
    // TODO select image that is "closest" to desired size
    img.src = availableImages[0].url;

    return img;
  }

  private fetchAudio(url: string): HTMLAudioElement {
    const audio = new Audio(url);

    // TODO wait for audio to preload
    //audio.addEventListener('canplaythrough', event => {
    //  console.log('can play!');
    //});

    return audio;
  }
}
