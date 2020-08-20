import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { KnowledgeManagerService } from 'src/app/shared/knowledge-manager.service';
import { Category, Item, Period, ArtistKnowledgeBase, TrackKnowledgeBase, DisplayableItem } from 'src/app/shared/types';
import { ResourceManagerService } from 'src/app/shared/resource-manager.service';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent implements OnInit {

  private type: 'tracks' | 'artists' = 'tracks';
  private period: 'short_term' | 'medium_term' | 'long_term' = 'long_term';

  private displayableItems: DisplayableItem[];

  constructor(private knowledgeManager: KnowledgeManagerService,
              private resourceManager: ResourceManagerService) { }

  ngOnInit() {
    this.onUserSelection();
  }

  onUserSelection() {
    console.log(this.type);
    console.log(this.period);

    // build category
    let t: Item;
    if (this.type === 'tracks') {
      t = Item.Track;
    } else {
      t = Item.Artist;
    }

    let p: Period;
    if (this.period === 'short_term') {
      p = Period.ShortTerm;
    } else if (this.period === 'medium_term') {
      p = Period.MediumTerm;
    } else {
      p = Period.LongTerm;
    }

    const categories: Category[] = [{type: t, period: p}];

    this.knowledgeManager.fetchKnowledge(categories).subscribe(value => {
      // get category
      if (this.type === 'tracks') {
        const tracks = this.knowledgeManager.getTracksFromPeriod(p);
        this.resourceManager.fetchResourcesForTracks(tracks);
        this.displayableItems = this.resourceManager.getTracksAsDisplayableItems(tracks);
      } else {
        const artists = this.knowledgeManager.getArtistsFromPeriod(p);
        this.resourceManager.fetchResourcesForArtists(artists);
        this.displayableItems = this.resourceManager.getArtistsAsDisplayableItems(artists);
      }
    });
  }

  playAudio(index: number) {
    if (this.displayableItems[index].audio) {
      this.displayableItems[index].audio.play();
    }
  }

  pauseAudio(index: number) {
    if (this.displayableItems[index].audio) {
      this.displayableItems[index].audio.pause();
    }
  }
}
