import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { SpotifyAuthToken } from '../auth/auth.service';
import { Period, Category, Item } from './types';

export interface AccessTokenRequest {
  clientId: string;
  codeVerifier: string;
  code: string;
  redirectURI: string;
}

export interface RefreshAccessTokenRequest {
  clientId: string;
  refreshToken: string;
}

export interface TrackRequest {
  accessToken: string;
  deviceId: string;
  trackURI: string;
}

export interface TopChartRequest {
  accessToken: string;
  category: Category;
}

export interface UserProfileRequest {
  accessToken: string;
}

export interface CreatePlaylistRequest {
  accessToken: string;
  userId: string;
  playlistName: string;
}

export interface AddTracksToPlaylistRequest {
  accessToken: string;
  playlistId: string;
  trackIds: string[];
}

export interface SpotifySimplifiedArtistObject {
  id: string;
  name: string;
}

export interface SpotifyImageObject {
  height?: number;
  url: string;
  width?: number;
}

export interface SpotifyArtistObject extends SpotifySimplifiedArtistObject {
  images: SpotifyImageObject[];
}

export interface SpotifySimplifiedAlbumObject {
  name: string;
  id: string;
  images: SpotifyImageObject[];
}

export interface SpotifyTrackObject {
  id: string;
  name: string;
  artists: SpotifySimplifiedArtistObject[];
  album: SpotifySimplifiedAlbumObject;
  preview_url: string;
}

export interface SpotifyPagingObject {
  href: string;
  items: SpotifyArtistObject[] | SpotifyTrackObject[];
  limit: number;
  next: string;
  offset: number;
  previous: string;
  total: number;
}

export interface SpotifyUserObject {
  id: string;
}

export interface SpotifyPlaylistObject {
  id: string;
}

@Injectable({providedIn: 'root'})
export class SpotifyHttpClientService {
  private tokenEndpoint = 'https://accounts.spotify.com/api/token';
  private playEndpoint = 'https://api.spotify.com/v1/me/player/play';
  private playlistsEndpoint = 'https://api.spotify.com/v1/playlists';
  private personalizationEndpoint = 'https://api.spotify.com/v1/me/top';
  private currentUserProfileEndpoint = 'https://api.spotify.com/v1/me';
  private usersEndpoint = 'https://api.spotify.com/v1/users';

  constructor(private http: HttpClient) {
  }

  // Authentication
  getAccessToken(request: AccessTokenRequest) {
    const httpParams = new HttpParams()
      .set('client_id', request.clientId)
      .set('code_verifier', request.codeVerifier)
      .set('grant_type', 'authorization_code')
      .set('code', request.code)
      .set('redirect_uri', request.redirectURI);
  
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded'
      }),
      params: httpParams
    };
  
    return this.http.post<SpotifyAuthToken>(this.tokenEndpoint, undefined, httpOptions);
  }

  refreshAccessToken(request: RefreshAccessTokenRequest) {
    const httpParams = new HttpParams()
      .set('client_id', request.clientId)
      .set('refresh_token', request.refreshToken)
      .set('grant_type', 'refresh_token');
  
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded'
      }),
      params: httpParams
    };

    // need to check for errors!!
    return this.http.post<SpotifyAuthToken>(this.tokenEndpoint, undefined, httpOptions);
  }

  // Player

  requestTrack(request: TrackRequest) {
    const playSongUrl = this.playEndpoint + '?';

    const httpOptions = {
        headers: new HttpHeaders()
          .set('Authorization', 'Bearer ' + request.accessToken),

        params: new HttpParams()
          .set('device_id', request.deviceId)
      };

    const requestBody = {
      uris: [request.trackURI]
    };

    return this.http.put(playSongUrl, requestBody, httpOptions);
  }


  // Personalization
  getUserTop(request: TopChartRequest) {
    let requestWhat: string;

    switch (request.category.type) {
      case Item.Artist:
        requestWhat = 'artists';
        break;

      case Item.Track:
        requestWhat = 'tracks';
        break;
    }

    return this.getUserTopHelper(request.accessToken, requestWhat, request.category.period);
  }
  
  private getUserTopHelper(accessToken: string, what: string, period: Period) {
    const chartURL = this.personalizationEndpoint + '/' + what;
    
    let periodStr = '';
    switch (period) {
      case Period.ShortTerm:
        periodStr = 'short_term';
        break;
      case Period.MediumTerm:
        periodStr = 'medium_term';
        break;
      case Period.LongTerm:
        periodStr = 'long_term';
        break;
      default:
        periodStr = 'long_term';
    }

    const httpParams = new HttpParams()
    .set('limit', '50')
    .set('time_range', periodStr);

    const httpOptions = {
        headers: new HttpHeaders()
          .set('Authorization', 'Bearer ' + accessToken),
        params: httpParams
      };

    return this.http.get<SpotifyPagingObject>(chartURL, httpOptions);
  }

  // User profile
  getUserId(request: UserProfileRequest) {
    const httpOptions = {
      headers: new HttpHeaders()
        .set('Authorization', 'Bearer ' + request.accessToken)
    };

    return this.http.get<SpotifyUserObject>(this.currentUserProfileEndpoint, httpOptions);
  }

  // Playlist
  createPlaylist(request: CreatePlaylistRequest) {
    const url = this.usersEndpoint + '/' + request.userId + '/playlists';

    const httpOptions = {
      headers: new HttpHeaders()
      .set('Authorization', 'Bearer ' + request.accessToken)
      .set('Content-Type', 'application/json')
    };

    const body = {
      name: request.playlistName
    };

    return this.http.post<SpotifyPlaylistObject>(url, body, httpOptions);
  }

  addTracksToPlaylist(request: AddTracksToPlaylistRequest) {
    const url = this.playlistsEndpoint + '/' + request.playlistId + '/tracks';

    const httpOptions = {
      headers: new HttpHeaders()
      .set('Authorization', 'Bearer ' + request.accessToken)
      .set('Content-Type', 'application/json')
    };

    const trackURIs = [];

    for (const trackId of request.trackIds) {
      trackURIs.push('spotify:track:' + trackId);
    }

    const body = {
      uris: trackURIs
    };

    return this.http.post(url, body, httpOptions);
  }
}
