/*
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import { Artist, Category, Identifier, ImageURL, Item, Period, Track } from "spotify-lib";


/// Knowledge Base ///

export interface GameConfiguration {
  useTracks: boolean;
  useArtists: boolean;
  useShortTermPeriod: boolean;
  useMediumTermPeriod: boolean;
  useLongTermPeriod: boolean;
}


export interface ArtistKnowledgeBase {
  period: Period;
  artists: Artist[];
}


export interface TrackKnowledgeBase {
  period: Period;
  tracks: Track[];
}

/**
 * Holds currently available information on user's top artists and tracks
 */
export class AppKnowledgeBase {
  private artists: Map<Period, ArtistKnowledgeBase> = new Map();
  private tracks: Map<Period, TrackKnowledgeBase> = new Map();


  addArtistKnowledge(period: Period, knowledgeBase: ArtistKnowledgeBase) {
    this.artists.set(period, knowledgeBase);
  }


  addTrackKnowledge(period: Period, knowledgeBase: TrackKnowledgeBase) {
    this.tracks.set(period, knowledgeBase);
  }


  getArtistsFromPeriod(period: Period): ArtistKnowledgeBase {
    const artists = this.artists.get(period);

    if (!artists) {
      return {period, artists: []};
    }

    return artists;
  } 


  getTracksFromPeriod(period: Period): TrackKnowledgeBase {
    const tracks = this.tracks.get(period);

    if (!tracks) {
      return {period, tracks: []};
    }

    return tracks;
  }


  hasKnowledge(category: Category): boolean {
    switch (category.type) {
      case Item.Artist:
        return this.artists.has(category.period);

      case Item.Track:
        return this.tracks.has(category.period);
    }
  }


  getCategorySize(category: Category): number {
    switch (category.type) {
      case Item.Artist: {
        const cat = this.artists.get(category.period);

        if (!cat) {
          return -1;
        }

        return cat.artists.length;
      }
        
      case Item.Track: {
        const cat = this.tracks.get(category.period);

        if (!cat) {
          return -1;
        }

        return cat.tracks.length;
      }
    }
  }
}


export class GameKnowledgeBase {

  constructor(
    private readonly gameConfiguration: GameConfiguration,
    private readonly knowledgeBase: AppKnowledgeBase) {
    }


  /** 
   * can be 1, 2, 3, 4 or 6 (0 in error case)
   */ 
  getCategories(): Category[] {
    const cat: Category[] = [];

    if (this.gameConfiguration.useArtists) {
      if (this.gameConfiguration.useShortTermPeriod) {
        cat.push({type: Item.Artist, period: Period.ShortTerm});
      }

      if (this.gameConfiguration.useMediumTermPeriod) {
        cat.push({type: Item.Artist, period: Period.MediumTerm});
      }

      if (this.gameConfiguration.useLongTermPeriod) {
        cat.push({type: Item.Artist, period: Period.LongTerm});
      }
    }

    if (this.gameConfiguration.useTracks) {
      if (this.gameConfiguration.useShortTermPeriod) {
        cat.push({type: Item.Track, period: Period.ShortTerm});
      }

      if (this.gameConfiguration.useMediumTermPeriod) {
        cat.push({type: Item.Track, period: Period.MediumTerm});
      }

      if (this.gameConfiguration.useLongTermPeriod) {
        cat.push({type: Item.Track, period: Period.LongTerm});
      }
    }

    return cat;
  }

  /**
   * @returns -1 for error
   */
  getCategorySize(category: Category): number {
    return this.knowledgeBase.getCategorySize(category);
  }


  getTrack(period: Period, index: number): Track | undefined {
    const tracksKnowledge = this.knowledgeBase.getTracksFromPeriod(period);

    if (tracksKnowledge.tracks.length < index) {
      return undefined;
    }

    return tracksKnowledge.tracks[index];
  }


  getArtist(period: Period, index: number): Artist | undefined {
    const artistsKnowledge = this.knowledgeBase.getArtistsFromPeriod(period);

    if (artistsKnowledge.artists.length < index) {
      return undefined;
    }

    return artistsKnowledge.artists[index];
  }
}


/// Questions ///

export enum Difficulty {
  Easy,
  Medium,
  Hard,
  Unknown
}


export interface Question {
  category: Category;
  difficulty: Difficulty;

  iLeft: number;
  iRight: number;
  answer: number;

  text: string;
}


/// Display ///

export interface DisplayableItem {
  image: HTMLImageElement;
  audio: HTMLAudioElement | undefined;
  text: DisplayableText;

  knowledgeId: Identifier;
}


export interface DisplayableQuestion extends Question {
  leftText: DisplayableText;
  rightText: DisplayableText;
}


interface DisplayableText {
  track: string;
  artist: string;
  album: string;
}


export function createEmptyDisplayableQuestion(): DisplayableQuestion {
  return {
    leftText: createEmptyDisplayableText(),
    rightText: createEmptyDisplayableText(),

    category: {type: Item.Track, period: Period.LongTerm},
    difficulty: Difficulty.Easy,

    iLeft: 0,
    iRight: 0,
    answer: 0,

    text: ""
  };
}


function createEmptyDisplayableText(): DisplayableText {
  return {track: "", artist: "", album: ""};
}
