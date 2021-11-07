/*
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import { Injectable } from '@angular/core';
import { Item, Period } from 'spotify-lib';
import { GameKnowledgeBase, GameConfiguration } from 'src/app/shared/types';
import { Observable } from 'rxjs';
import { KnowledgeManagerService } from 'src/app/shared/knowledge-manager.service';

@Injectable({providedIn: 'root'})
export class GameConfiguratorService {
  private configuringGame: Observable<GameKnowledgeBase | null> | undefined = undefined;

  
  constructor(private knowledgeManager: KnowledgeManagerService) {
  }


  configureGame(config: GameConfiguration): Observable<GameKnowledgeBase | null> {
    this.configuringGame = new Observable((observer) => {
      // build categories
      const categories = [];

      if (config.useArtists) {
        if (config.useShortTermPeriod) {
          categories.push({type: Item.Artist, period: Period.ShortTerm});
        }

        if (config.useMediumTermPeriod) {
          categories.push({type: Item.Artist, period: Period.MediumTerm});
        }

        if (config.useLongTermPeriod) {
          categories.push({type: Item.Artist, period: Period.LongTerm});
        }
      }

      if (config.useTracks) {
        if (config.useShortTermPeriod) {
          categories.push({type: Item.Track, period: Period.ShortTerm});
        }

        if (config.useMediumTermPeriod) {
          categories.push({type: Item.Track, period: Period.MediumTerm});
        }

        if (config.useLongTermPeriod) {
          categories.push({type: Item.Track, period: Period.LongTerm});
        }
      }

      this.knowledgeManager.fetchKnowledge(categories).subscribe(success => {
        if (success) {
          observer.next(new GameKnowledgeBase(config, this.knowledgeManager.getKnowledgeBase()));
        } else {
          observer.next(null);
        }
      });
    });

    return this.configuringGame;
  }
}
