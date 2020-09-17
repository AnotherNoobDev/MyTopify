import { Injectable } from '@angular/core';
import { Identifier, 
  GameKnowledgeBase, 
  Question, 
  Item, Artist, Track, 
  ImageURL, 
  ArtistKnowledgeBase, TrackKnowledgeBase, 
  DisplayableItem } from './types';
import { ScreenService } from './screen.service';
import { Subject } from 'rxjs';
import { getTrackShortName } from './utility';

@Injectable({providedIn: 'root'})
export class ResourceManagerService {
  private knowledgeBase: GameKnowledgeBase | TrackKnowledgeBase | ArtistKnowledgeBase;
  private gameQuestions: Question[];

  private audioStorage: Map<Identifier, HTMLAudioElement> = new Map();
  private imageStorage: Map<Identifier, HTMLImageElement> = new Map();

  private resourceReloadSubject = new Subject<void>();

  constructor(private screen: ScreenService) {
    this.screen.recommendedImgSizeChanged().subscribe(() => {
      // invalidate images
      this.imageStorage.clear();

      // refetch using the knowledge base
      if (this.knowledgeBase instanceof GameKnowledgeBase) {
        this.fetchResourcesForGame(this.gameQuestions, this.knowledgeBase);
      } else if ('tracks' in this.knowledgeBase) {
        this.fetchResourcesForTracks(this.knowledgeBase);
      } else {
        this.fetchResourcesForArtists(this.knowledgeBase);
      }

      // notify
      this.resourceReloadSubject.next();
    });
  }

  resourceReload() {
    return this.resourceReloadSubject.asObservable();
  }

  getImagesForQuestion(question: Question): HTMLImageElement[] {
    const images = [];

    const kb = this.knowledgeBase as GameKnowledgeBase;

    switch (question.category.type) {
      case Item.Artist:
        images.push(this.getImage(kb.getArtist(question.category.period, question.iLeft)));
        images.push(this.getImage(kb.getArtist(question.category.period, question.iRight)));
        break;

      case Item.Track:
        images.push(this.getImage(kb.getTrack(question.category.period, question.iLeft)));
        images.push(this.getImage(kb.getTrack(question.category.period, question.iRight)));
        break;
    }

    return images;
  }

  getAudioForQuestion(question: Question): HTMLAudioElement[] {
    if (question.category.type === Item.Artist) {
      return null;
    }

    const audio = [];

    const kb = this.knowledgeBase as GameKnowledgeBase;

    audio.push(this.getAudio(kb.getTrack(question.category.period, question.iLeft)));
    audio.push(this.getAudio(kb.getTrack(question.category.period, question.iRight)));

    return audio;
  }

  getImage(item: Artist | Track) {
    if ('album' in item) {
      return this.imageStorage.get(item.album.id);
    } else {
      return this.imageStorage.get(item.id);
    }
  }

  getAudio(track: Track) {
    return this.audioStorage.get(track.id);
  }

  getArtistsAsDisplayableItems(knowledgeBase: ArtistKnowledgeBase): DisplayableItem[] {
    const items = [];

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
    const items = [];

    // TODO duplication with DisplayableQuestion (see text)
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

  fetchResourcesForArtist(artist: Artist) {
    if (this.imageStorage.has(artist.id)) {
      return;
    }

    this.imageStorage.set(artist.id, 
      this.fetchImage(artist.images, this.screen.getImageSizeForGameView(), this.screen.getImageSizeForGameView()));
  }

  fetchResourcesForTrack(track: Track) {
    // image
    if (!this.imageStorage.has(track.album.id)) {
      this.imageStorage.set(track.album.id, 
        this.fetchImage(track.album.images, this.screen.getImageSizeForGameView(), this.screen.getImageSizeForGameView()));
    }

    // audio
    if (!this.audioStorage.has(track.id)) {
      this.audioStorage.set(track.id, this.fetchAudio(track.previewURL));
    }
  }

  private fetchImage(availableImages: ImageURL[], desiredWidth: number, desiredHeight: number): HTMLImageElement {
    const img = new Image(desiredWidth, desiredHeight);
    img.style.display = 'block';
    img.style.margin = '0.5rem';

    // TODO? wait for image to preload
    //img.onload
    
    for (const image of availableImages) {
      img.src = image.url;
    
      // select image that is "closest" to desired size
      if (image.width && image.width >= desiredWidth) {
        break;
      }
    }

    return img;
  }

  private fetchAudio(url: string): HTMLAudioElement {
    const audio = new Audio(url);
    audio.loop = true;

    // TODO? wait for audio to preload
    //audio.addEventListener('canplaythrough', event => {
    //  console.log('can play!');
    //});

    return audio;
  }
}
