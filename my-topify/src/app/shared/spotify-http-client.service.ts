import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { SpotifyAuthToken } from '../auth/auth.service';

export enum Period {
  ShortTerm,
  MediumTerm,
  LongTerm
}

@Injectable({providedIn: 'root'})
export class SpotifyHttpClientService {
  private tokenEndpoint = 'https://accounts.spotify.com/api/token';
  private playEndpoint = 'https://api.spotify.com/v1/me/player/play';
  private playlistsEndpoint = 'https://api.spotify.com/v1/playlists';
  private personalizationEndpoint = 'https://api.spotify.com/v1/me/top';

  constructor(private http: HttpClient) {
  }

  // TODO error handling
  // TODO all arguments are strings --> group in custom types to avoid ordering errors!!

  // Authentication
  getAccessToken(clientId: string, codeVerifier: string, code: string, redirectURI: string) {
    const httpParams = new HttpParams()
      .set('client_id', clientId)
      .set('code_verifier', codeVerifier)
      .set('grant_type', 'authorization_code')
      .set('code', code)
      .set('redirect_uri', redirectURI);
  
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded'
      }),
      params: httpParams
    };
  
    return this.http.post<SpotifyAuthToken>(this.tokenEndpoint, undefined, httpOptions);
  }

  refreshAccessToken(clientId: string, refreshToken: string) {
    const httpParams = new HttpParams()
      .set('client_id', clientId)
      .set('refresh_token', refreshToken)
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

  requestSong(accessToken: string, deviceId: string, songURI: string) {
    const playSongUrl = this.playEndpoint + '?';

    const httpOptions = {
        headers: new HttpHeaders()
          .set('Authorization', 'Bearer ' + accessToken),

        params: new HttpParams()
          .set('device_id', deviceId)
      };

    const requestBody = {
      uris: [songURI]
    };

    return this.http.put(playSongUrl, requestBody, httpOptions);
  }


  // Playlist

  getPlaylist(accessToken: string, playlistId: string) {
    const getPlaylistUrl = this.playlistsEndpoint + '/' + playlistId;

    const httpOptionsForPlaylist = {
        headers: new HttpHeaders()
          .set('Authorization', 'Bearer ' + accessToken)
      };

    return this.http.get(getPlaylistUrl, httpOptionsForPlaylist);
  }


  // Personalization
  getUserTopTracks(accessToken: string, period: Period) {
    return this.getUserTop(accessToken, 'tracks', period);
  }

  getUserTopArtists(accessToken: string, period: Period) {
    return this.getUserTop(accessToken, 'artists', period);
  }
  
  private getUserTop(accessToken: string, what: string, period: Period) {
    const getTopTracksURL = this.personalizationEndpoint + '/' + what;
    
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

    return this.http.get(getTopTracksURL, httpOptions);
  }
}
