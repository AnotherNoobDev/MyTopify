import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { KnowledgeManagerService } from 'src/app/shared/knowledge-manager.service';
import { Category, Item, Period, ArtistKnowledgeBase, TrackKnowledgeBase, DisplayableItem } from 'src/app/shared/types';
import { ResourceManagerService } from 'src/app/shared/resource-manager.service';
import { AuthService } from 'src/app/auth/auth.service';
import { SpotifyHttpClientService } from 'src/app/shared/spotify-http-client.service';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['../../shared/style/common.css', './chart.component.css']
})
export class ChartComponent implements OnInit, OnDestroy {

  private uType: 'tracks' | 'artists' = 'tracks';
  private uPeriod: 'short_term' | 'medium_term' | 'long_term' = 'long_term';

  private period: Period;

  private createPlaylistEnabled = false;

  private displayableItems: DisplayableItem[] = [];
  private currentlyPlayingAudio = -1;

  constructor(private knowledgeManager: KnowledgeManagerService,
              private resourceManager: ResourceManagerService,
              private auth: AuthService,
              private spotifyHttpClient: SpotifyHttpClientService) { }

  ngOnInit() {
    this.onUserSelection();
  }

  ngOnDestroy() {
    this.resetAudio();
  }

  onUserSelection() {
    this.resetAudio();
    this.createPlaylistEnabled = false;

    // build category
    let t: Item;
    if (this.uType === 'tracks') {
      t = Item.Track;
    } else {
      t = Item.Artist;
    }

    if (this.uPeriod === 'short_term') {
      this.period = Period.ShortTerm;
    } else if (this.uPeriod === 'medium_term') {
      this.period = Period.MediumTerm;
    } else {
      this.period = Period.LongTerm;
    }

    const categories: Category[] = [{type: t, period: this.period}];

    this.knowledgeManager.fetchKnowledge(categories).subscribe(value => {
      // get category
      if (this.uType === 'tracks') {
        const tracks = this.knowledgeManager.getTracksFromPeriod(this.period);
        this.resourceManager.fetchResourcesForTracks(tracks);
        this.displayableItems = this.resourceManager.getTracksAsDisplayableItems(tracks);

        if (this.displayableItems) {
          this.createPlaylistEnabled = true;
        }
      } else {
        const artists = this.knowledgeManager.getArtistsFromPeriod(this.period);
        this.resourceManager.fetchResourcesForArtists(artists);
        this.displayableItems = this.resourceManager.getArtistsAsDisplayableItems(artists);
      }
    });
  }

  private resetAudio() {
    if (this.currentlyPlayingAudio >= 0) {
      this.displayableItems[this.currentlyPlayingAudio].audio.pause();
    }

    this.currentlyPlayingAudio = -1;
  }

  toggleAudio(index: number) {
    if (this.displayableItems[index].audio) {
      if (this.currentlyPlayingAudio === index) {
        this.pauseAudio(index);
      } else {
        if (this.currentlyPlayingAudio >= 0) {
          this.pauseAudio(this.currentlyPlayingAudio);
        }

        this.playAudio(index);
      }
    }
  }

  playAudio(index: number) {
    this.displayableItems[index].audio.play();
    this.currentlyPlayingAudio = index;
  }

  pauseAudio(index: number) {
    this.displayableItems[index].audio.pause();
    this.currentlyPlayingAudio = -1;
  }

  onCreatePlaylist() {
    this.auth.getCurrentUserId().then(user => {
      this.spotifyHttpClient.createPlaylist({
        accessToken: this.auth.getAccessToken(), 
        userId: user,
        playlistName: 'MyTopify Top Tracks ' + this.knowledgeManager.getDisplayablePeriod(this.period)
      }).subscribe(responseData => {

        const ids = [];
        for (const item of this.displayableItems) {
          ids.push(item.knowledgeId);
        }

        this.spotifyHttpClient.addTracksToPlaylist({
          accessToken: this.auth.getAccessToken(),
          playlistId: responseData.id,
          trackIds: ids
        }).subscribe(() => {
          console.log('Created playlist!');
        });
      });
    });
  }
}
