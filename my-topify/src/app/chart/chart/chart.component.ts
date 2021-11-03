/*
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { KnowledgeManagerService } from 'src/app/shared/knowledge-manager.service';
import { DisplayableItem } from 'src/app/shared/types';
import { ResourceManagerService } from 'src/app/shared/resource-manager.service';
import { Category, Item, Period, AuthService, SpotifyHttpClientService } from 'spotify-lib';
import { NotificationPriority, NotificationsService, NotificationType } from 'notifications-lib';
import { debounce } from 'src/app/shared/utility';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['../../shared/style/common.css', './chart.component.css']
})
export class ChartComponent implements OnInit, OnDestroy {

  @ViewChild(CdkVirtualScrollViewport, {static: false}) virtualScroll: CdkVirtualScrollViewport | undefined = undefined;

  public uType: 'tracks' | 'artists' = 'tracks';
  public uPeriod: 'short_term' | 'medium_term' | 'long_term' = 'long_term';
  private period: Period = Period.LongTerm;

  public createPlaylistEnabled = false;

  public displayableItems: DisplayableItem[] = [];
  public currentlyPlayingAudio = -1;

  constructor(private knowledgeManager: KnowledgeManagerService,
              private resourceManager: ResourceManagerService,
              private auth: AuthService,
              private spotifyHttpClient: SpotifyHttpClientService,
              private notificationService: NotificationsService) { }

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

    this.knowledgeManager.fetchKnowledge(categories).subscribe(success => {
      if (!success) {
        this.displayableItems = [];
        
        this.notificationService.notify({
          type: NotificationType.ERROR, 
          msg: 'Failed to retrieve data from Spotify.',
          priority: NotificationPriority.STANDARD
        });

        return;
      }

      // get category
      if (this.uType === 'tracks') {
        const tracks = this.knowledgeManager.getTracksFromPeriod(this.period);
        this.resourceManager.fetchResourcesForTracks(tracks!);
        this.displayableItems = this.resourceManager.getTracksAsDisplayableItems(tracks!);

        if (this.displayableItems) {
          this.createPlaylistEnabled = true;
        }
      } else {
        const artists = this.knowledgeManager.getArtistsFromPeriod(this.period);
        this.resourceManager.fetchResourcesForArtists(artists!);
        this.displayableItems = this.resourceManager.getArtistsAsDisplayableItems(artists!);
      }

      // reset view to top
      if (this.virtualScroll) {
        this.virtualScroll.scrollToIndex(0);
      }
    });
  }

  private resetAudio() {
    if (this.currentlyPlayingAudio >= 0) {
      const audio = this.displayableItems[this.currentlyPlayingAudio].audio;
      if (audio) {
        audio.pause();
      }
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
    } else {
      this.notificationService.notify({
        type: NotificationType.ERROR, 
        msg: 'Audio not available.',
        priority: NotificationPriority.IMMEDIATE
      });
    }
  }

  playAudio(index: number) {
    const audio = this.displayableItems[index].audio;
    if (audio) {
      audio.play();
    }
    
    this.currentlyPlayingAudio = index;
  }

  pauseAudio(index: number) {
    const audio = this.displayableItems[index].audio;
    if (audio) {
      audio.pause();
    }

    this.currentlyPlayingAudio = -1;
  }

  onCreatePlaylist() {
    this.createPlaylist();
  }

  private debounceIntervalMs = 250;

  private createPlaylist = debounce(() => {
    const playlist = 'MyTopify Top Tracks ' + this.knowledgeManager.getDisplayablePeriod(this.period);
    
    this.auth.getCurrentUserId().then(user => {
      if (!user) {
        this.notificationService.notify({
          type: NotificationType.ERROR, 
          msg: 'Failed to obtain Spotify UserId.',
          priority: NotificationPriority.STANDARD
        });
        return;
      }

      this.spotifyHttpClient.createPlaylist({
        accessToken: this.auth.getAccessToken(), 
        userId: user,
        playlistName: playlist
      }).subscribe(
        responseData => {
          const ids = [];
          for (const item of this.displayableItems) {
            ids.push(item.knowledgeId);
          }

          this.spotifyHttpClient.addTracksToPlaylist({
            accessToken: this.auth.getAccessToken(),
            playlistId: responseData.id,
            trackIds: ids
          }).subscribe(
            () => {
              this.notificationService.notify({
                type: NotificationType.INFO, 
                msg: 'Created playlist: ' + playlist,
                priority: NotificationPriority.STANDARD
              });
            },
            err => {
              this.notificationService.notify({
                type: NotificationType.ERROR, 
                msg: 'An error occured when adding tracks to the playlist.',
                priority: NotificationPriority.STANDARD});
            });
        },
        err => {
          this.notificationService.notify({
            type: NotificationType.ERROR, 
            msg: 'Failed to create playlist.',
            priority: NotificationPriority.STANDARD
          });
        });
    });
  }, this.debounceIntervalMs);
}
