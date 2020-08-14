export enum ResourceType {
  Artist,
  Track
}

export enum Period {
  ShortTerm,
  MediumTerm,
  LongTerm
}

export interface Category {
  type: ResourceType;
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

export interface Track {
  id: Identifier;
  name: string;
  artists: string[];
  album: string;
  images: ImageURL[];
  previewURL: string; // 30 seconds MP3
}

export interface TrackKnowledgeBase {
  period: Period;
  size: number;
  tracks: Track[];
} 

export class GameKnowledgeBase {
  gameConfiguration: GameConfiguration;
  artistKnowledgeBase: Map<Period, ArtistKnowledgeBase>;
  trackKnowledgeBase: Map<Period, TrackKnowledgeBase>;

  /** 
   * can be 1, 2, 3, 4 or 6
   */ 
  getCategories(): Category[] {
    const cat = [];

    if (this.gameConfiguration.useArtists) {
      if (this.gameConfiguration.useShortTermPeriod) {
        cat.push({type: ResourceType.Artist, period: Period.ShortTerm});
      }

      if (this.gameConfiguration.useMediumTermPeriod) {
        cat.push({type: ResourceType.Artist, period: Period.MediumTerm});
      }

      if (this.gameConfiguration.useLongTermPeriod) {
        cat.push({type: ResourceType.Artist, period: Period.LongTerm});
      }
    }

    if (this.gameConfiguration.useTracks) {
      if (this.gameConfiguration.useShortTermPeriod) {
        cat.push({type: ResourceType.Track, period: Period.ShortTerm});
      }

      if (this.gameConfiguration.useMediumTermPeriod) {
        cat.push({type: ResourceType.Track, period: Period.MediumTerm});
      }

      if (this.gameConfiguration.useLongTermPeriod) {
        cat.push({type: ResourceType.Track, period: Period.LongTerm});
      }
    }

    return cat;
  }

  getCategorySize(category: Category): number {
    switch (category.type) {
      case ResourceType.Artist:
        if (this.artistKnowledgeBase && this.artistKnowledgeBase.has(category.period)) {
          return this.artistKnowledgeBase.get(category.period).size;
        } else {
          return -1;
        }

      case ResourceType.Track:
        if (this.trackKnowledgeBase && this.trackKnowledgeBase.has(category.period)) {
          return this.trackKnowledgeBase.get(category.period).size;
        } else {
          return -1;
        }
    }
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
}

