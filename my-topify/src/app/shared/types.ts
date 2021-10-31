/*
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import { Artist, Category, Identifier, ImageURL, Item, Period, Track } from "spotify-lib";

export interface GameConfiguration {
  useTracks: boolean;
  useArtists: boolean;
  useShortTermPeriod: boolean;
  useMediumTermPeriod: boolean;
  useLongTermPeriod: boolean;
}

export interface ArtistKnowledgeBase {
  period: Period;
  size: number;
  artists: Artist[];
}

export interface TrackKnowledgeBase {
  period: Period;
  size: number;
  tracks: Track[];
}

export class AppKnowledgeBase {
  artists: Map<Period, ArtistKnowledgeBase> = new Map();
  tracks: Map<Period, TrackKnowledgeBase> = new Map();

  addArtistKnowledge(period: Period, knowledgeBase: ArtistKnowledgeBase) {
    this.artists.set(period, knowledgeBase);
  }

  addTrackKnowledge(period: Period, knowledgeBase: TrackKnowledgeBase) {
    this.tracks.set(period, knowledgeBase);
  }

  getArtistsFromPeriod(period: Period) {
    return this.artists.get(period);
  } 

  getTracksFromPeriod(period: Period) {
    return this.tracks.get(period);
  }

  hasKnowledge(category: Category): boolean {
    switch (category.type) {
      case Item.Artist:
        return (this.artists && this.artists.has(category.period));

      case Item.Track:
        return (this.tracks && this.tracks.has(category.period));
    }
  }
}

export class GameKnowledgeBase {
  gameConfiguration: GameConfiguration | undefined = undefined;
  knowledgeBase: AppKnowledgeBase | undefined = undefined;

  /** 
   * can be 1, 2, 3, 4 or 6 (0 in error case)
   */ 
  getCategories(): Category[] {
    const cat: Category[] = [];

    if (!this.gameConfiguration) {
      return cat;
    }

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
    if (!this.knowledgeBase) {
      return -1;
    }

    switch (category.type) {
      case Item.Artist:
        if (this.knowledgeBase.artists && this.knowledgeBase.artists.has(category.period)) {
          const cat = this.knowledgeBase.artists.get(category.period);
          
          if (!cat) {
            return -1;
          }

          return cat.size;
        } else {
          return -1;
        }

      case Item.Track:
        if (this.knowledgeBase.tracks && this.knowledgeBase.tracks.has(category.period)) {
          const cat = this.knowledgeBase.tracks.get(category.period);
          
          if (!cat) {
            return -1;
          }
          return cat.size;
        } else {
          return -1;
        }
    }
  }

  getTrack(period: Period, index: number): Track | undefined {
    if (!this.knowledgeBase) {
      return undefined;
    }

    const tracksKnowledge = this.knowledgeBase.tracks.get(period);

    if (!tracksKnowledge) {
      return undefined;
    }

    return tracksKnowledge.tracks[index];
  }

  getArtist(period: Period, index: number): Artist | undefined {
    if (!this.knowledgeBase) {
      return undefined;
    }

    const artistsKnowledge = this.knowledgeBase.artists.get(period);

    if (!artistsKnowledge) {
      return undefined;
    }

    return artistsKnowledge.artists[index];
  }
}

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

interface DisplayableText {
  track: string;
  artist: string;
  album: string;
}

function createEmptyDisplayableText(): DisplayableText {
  return {track: "", artist: "", album: ""};
}

export enum Resource {
  Audio,
  Image
}
