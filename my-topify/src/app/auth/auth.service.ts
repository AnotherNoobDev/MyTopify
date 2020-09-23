import { Injectable } from '@angular/core';
import * as base64js from 'base64-js';

import { sha256 } from 'js-sha256';
import { SpotifyHttpClientService } from '../shared/spotify-http-client.service';

export interface SpotifyAuthToken {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  token_type: string;
}

@Injectable({providedIn: 'root'})
export class AuthService {

  private clientId = 'a244c732df724f7595a7c9c4604d1179';
  private codeVerifier: string;
  private codeChallenge: string;

  private codeVerifierPossibleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';

  private redirectURI = 'http://localhost:4200/auth-callback';

  private authToken: SpotifyAuthToken = undefined;
  private authTokenValidUntil: Date;

  private refreshTokenBeforeMs: number = 60 * 1000;
  private refreshTokenTimeout: number;

  // local storage keys
  private LS_KEY_CODE_VERIFIER = 'HOFM_codeVerifier';
  private LS_KEY_AUTH_TOKEN = 'HOFM_authToken';
  private LS_KEY_AUTH_TOKEN_VALID_UNTIL = 'HOFM_authTokenValidUntil';

  // current user id
  private currentUserId: string;

  constructor(private spotifyHttpClient: SpotifyHttpClientService) {
    this.authToken = this.retrieveAuthTokenFromStorage();
    this.authTokenValidUntil = this.retrieveAuthTokenValidUntilFromStorage();
  }

  getClientId(): string {
    return this.clientId;
  }

  getRedirectURI(): string {
    return this.redirectURI;
  }

  getCodeVerifier(): string {
    if (!this.codeVerifier) {
      this.codeVerifier = this.retrieveCodeVerifierFromStorage();
    }

    return this.codeVerifier;
  }

  getCodeChallenge(): string {
    if (!this.codeVerifier || !this.codeChallenge) {
      this.generateCodeVerifierAndChallenge();
    }

    // store for retrieval after redirect
    localStorage.setItem(this.LS_KEY_CODE_VERIFIER, this.codeVerifier);

    return this.codeChallenge;
  }

  private generateCodeVerifierAndChallenge() {
    this.generateCodeVerifier();
    this.generateCodeChallenge();
  }

  private generateCodeVerifier() {
    this.codeVerifier = this.generateRandomString(128);
  }

  private generateRandomString(length: number) {
    let text = '';
    for (let i = 0; i < length; i++) {
      text += this.codeVerifierPossibleChars.charAt(Math.floor(Math.random() * this.codeVerifierPossibleChars.length));
    }

    return text;
  }

  private generateCodeChallenge() {
    const codeChallengeDigest = sha256(this.codeVerifier);
    const unencodedUtf8 = new Uint8Array(codeChallengeDigest.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

    this.codeChallenge = this.base64URL(unencodedUtf8);
  }

  private base64URL(unencodedUtf8: Uint8Array) {
    const encoded = base64js.fromByteArray(unencodedUtf8);
    const urlEncoded = encoded.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

    return urlEncoded;
  }

  isAuthenticated(): boolean {
    if (this.authToken && this.authTokenValidUntil) {
      const now = new Date();

      if (this.authTokenValidUntil > now) {
        return true;
      }
    }

    return false;
  }

  authenticate(authToken: SpotifyAuthToken) {
    this.authToken = authToken;

    // check if token exists
    if (!this.authToken) {
      return;
    }

    // update valid until
    this.authTokenValidUntil = new Date((new Date()).getTime() + this.authToken.expires_in * 1000);
    console.log('Auth token expires at: ' + this.authTokenValidUntil);

    // reset refresh token timer
    if (this.refreshTokenTimeout) {
      window.clearTimeout(this.refreshTokenTimeout);
    }

    this.refreshTokenTimeout = window.setTimeout(
      this.onRefreshTokenTimeout.bind(this), 
      this.authToken.expires_in * 1000 - this.refreshTokenBeforeMs);

    // save token
    // is this safe?
    localStorage.setItem(this.LS_KEY_AUTH_TOKEN, JSON.stringify(this.authToken));
    localStorage.setItem(this.LS_KEY_AUTH_TOKEN_VALID_UNTIL, this.authTokenValidUntil.toString());

    // remove code verifier (no longer needed)
    localStorage.removeItem(this.LS_KEY_CODE_VERIFIER);
  }

  private onRefreshTokenTimeout() {
      this.spotifyHttpClient.refreshAccessToken({ clientId: this.clientId, refreshToken: this.authToken.refresh_token })
        .subscribe(responseData => {
          console.log(responseData);
          this.authenticate(responseData);
        });
  }

  private retrieveAuthTokenFromStorage(): SpotifyAuthToken {
    const token: SpotifyAuthToken = JSON.parse(localStorage.getItem(this.LS_KEY_AUTH_TOKEN));

    return token;
  }

  private retrieveAuthTokenValidUntilFromStorage(): Date {
    const validUntil: Date = new Date(Date.parse(localStorage.getItem(this.LS_KEY_AUTH_TOKEN_VALID_UNTIL)));

    return validUntil;
  }

  private retrieveCodeVerifierFromStorage(): string {
    return localStorage.getItem(this.LS_KEY_CODE_VERIFIER);
  }

  getAccessToken(): string {
    if (!this.isAuthenticated()) {
      return '';
    }

    return this.authToken.access_token;
  }

  async getCurrentUserId(): Promise<string> {
    if (this.currentUserId) {
      return this.currentUserId;
    } else {
      const response = await this.spotifyHttpClient.getUserId({accessToken: this.getAccessToken()}).toPromise();
      this.currentUserId = response.id;

      return this.currentUserId;
    }
  }

  logout() {
    if (this.refreshTokenTimeout) {
      window.clearTimeout(this.refreshTokenTimeout);
    }
    
    this.refreshTokenTimeout = undefined;

    this.authToken = undefined;
    this.authTokenValidUntil = undefined;

    localStorage.removeItem(this.LS_KEY_AUTH_TOKEN);
    localStorage.removeItem(this.LS_KEY_AUTH_TOKEN_VALID_UNTIL);
  }
}
