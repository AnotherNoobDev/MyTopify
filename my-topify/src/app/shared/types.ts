export enum Item {
  Artist,
  Track
}

export enum Period {
  ShortTerm,
  MediumTerm,
  LongTerm
}

export interface Category {
  type: Item;
  period: Period;  
}

export interface GameConfiguration {
  useTracks: boolean;
  useArtists: boolean;
  useShortTermPeriod: boolean;
  useMediumTermPeriod: boolean;
  useLongTermPeriod: boolean;
}

export interface ImageURL {
  width: number;
  height: number;
  url: string;
}

export type Identifier = string;

export interface Artist {
  id: Identifier;
  name: string;
  images: ImageURL[];
}

export interface ArtistKnowledgeBase {
  period: Period;
  size: number;
  artists: Artist[];
}

export interface Album {
  id: Identifier;
  name: string;
  images: ImageURL[];
}

export interface Track {
  id: Identifier;
  name: string;
  artists: string[];
  album: Album;
  previewURL: string; // 30 seconds MP3
}

export interface TrackKnowledgeBase {
  period: Period;
  size: number;
  tracks: Track[];
}

export class AppKnowledgeBase {
  artists: Map<Period, ArtistKnowledgeBase>;
  tracks: Map<Period, TrackKnowledgeBase>;

  addArtistKnowledge(period: Period, knowledgeBase: ArtistKnowledgeBase) {
    if (!knowledgeBase) {
      return;
    }

    if (!this.artists) {
      this.artists = new Map();
    }

    this.artists.set(period, knowledgeBase);
  }

  addTrackKnowledge(period: Period, knowledgeBase: TrackKnowledgeBase) {
    if (!knowledgeBase) {
      return;
    }

    if (!this.tracks) {
      this.tracks = new Map();
    }

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
  gameConfiguration: GameConfiguration;
  knowledgeBase: AppKnowledgeBase;

  /** 
   * can be 1, 2, 3, 4 or 6
   */ 
  getCategories(): Category[] {
    const cat = [];

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

  getCategorySize(category: Category): number {
    switch (category.type) {
      case Item.Artist:
        if (this.knowledgeBase.artists && this.knowledgeBase.artists.has(category.period)) {
          return this.knowledgeBase.artists.get(category.period).size;
        } else {
          return -1;
        }

      case Item.Track:
        if (this.knowledgeBase.tracks && this.knowledgeBase.tracks.has(category.period)) {
          return this.knowledgeBase.tracks.get(category.period).size;
        } else {
          return -1;
        }
    }
  }

  getTrack(period: Period, index: number) {
    return this.knowledgeBase.tracks.get(period).tracks[index];
  }

  getArtist(period: Period, index: number) {
    return this.knowledgeBase.artists.get(period).artists[index];
  }
}

export enum Difficulty {
  Easy,
  Medium,
  Hard
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
  audio: HTMLAudioElement;
  text: string[];

  knowledgeId: Identifier;
}

export interface DisplayableQuestion extends Question {
  leftText: string[];
  rightText: string[];
}

export enum Resource {
  Audio,
  Image
}
