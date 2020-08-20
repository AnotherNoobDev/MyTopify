import { Injectable } from '@angular/core';
import { 
  Period, 
  GameKnowledgeBase, 
  GameConfiguration, 
  Item} from 'src/app/shared/types';
import { Observable } from 'rxjs';
import { KnowledgeManagerService } from 'src/app/shared/knowledge-manager.service';

@Injectable({providedIn: 'root'})
export class GameConfiguratorService {

  private gameKnowledgeBase: GameKnowledgeBase = new GameKnowledgeBase();

  private configuringGame: Observable<boolean>;

  constructor(private knowledgeManager: KnowledgeManagerService) {
  }

  configureGame(config: GameConfiguration): Observable<boolean> {
    this.gameKnowledgeBase.gameConfiguration = config;

    this.configuringGame = new Observable((observer) => {
      // build categories
      const categories = [];

      if (this.gameKnowledgeBase.gameConfiguration.useArtists) {
        if (this.gameKnowledgeBase.gameConfiguration.useShortTermPeriod) {
          categories.push({type: Item.Artist, period: Period.ShortTerm});
        }

        if (this.gameKnowledgeBase.gameConfiguration.useMediumTermPeriod) {
          categories.push({type: Item.Artist, period: Period.MediumTerm});
        }

        if (this.gameKnowledgeBase.gameConfiguration.useLongTermPeriod) {
          categories.push({type: Item.Artist, period: Period.LongTerm});
        }
      }

      if (this.gameKnowledgeBase.gameConfiguration.useTracks) {
        if (this.gameKnowledgeBase.gameConfiguration.useShortTermPeriod) {
          categories.push({type: Item.Track, period: Period.ShortTerm});
        }

        if (this.gameKnowledgeBase.gameConfiguration.useMediumTermPeriod) {
          categories.push({type: Item.Track, period: Period.MediumTerm});
        }

        if (this.gameKnowledgeBase.gameConfiguration.useLongTermPeriod) {
          categories.push({type: Item.Track, period: Period.LongTerm});
        }
      }

      this.knowledgeManager.fetchKnowledge(categories).subscribe(value => {
        this.gameKnowledgeBase.knowledgeBase = this.knowledgeManager.getKnowledgeBase();
        observer.next(value);
      });
    });

    return this.configuringGame;
  }

  getKnowledgeBase(): GameKnowledgeBase {
    return this.gameKnowledgeBase;
  }
}
