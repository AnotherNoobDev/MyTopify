/*
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { SpotifyHttpClientService } from 'src/app/shared/spotify-http-client.service';
import { NotificationsService, NotificationType } from 'notifications-lib';

@Component({
  selector: 'app-auth-callback',
  templateUrl: './auth-callback.component.html',
  styleUrls: ['../../shared/style/common.css', './auth-callback.component.css']
})
export class AuthCallbackComponent implements OnInit { 
  constructor(private route: ActivatedRoute,
              private router: Router,
              private spotifyHttpClient: SpotifyHttpClientService,
              private authService: AuthService,
              private notificationService: NotificationsService) { 
              }

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      return;
    }

    const error: string = this.route.snapshot.queryParams.error;

    if (error) {
      this.notificationService.notify({type: NotificationType.ERROR, msg: 'Login failed. Reason: ' + error});
      this.router.navigate(['']);
      return;
    }

    const callbackCode: string = this.route.snapshot.queryParams.code;
    const state: string = this.route.snapshot.queryParams.state;

    if (!this.isCallbackCodeValid(callbackCode) ||
        !this.isStateValid(state)) {

          this.router.navigate(['']);
          return;
    }

    this.spotifyHttpClient.getAccessToken({
      clientId: this.authService.getClientId(), 
      codeVerifier: this.authService.getCodeVerifier(), 
      code: callbackCode, 
      redirectURI: this.authService.getRedirectURI()})
        .subscribe(responseData => {
          const success = this.authService.authenticate(responseData);

          if (!success) {
            this.notificationService.notify({type: NotificationType.ERROR, msg: 'Login failed.'});
            this.router.navigate(['']);
          }
        }, 
        err => {
          this.notificationService.notify({type: NotificationType.ERROR, msg: 'Failed to obtain authentication token.'});
          this.router.navigate(['']);
        });
  }

  private isCallbackCodeValid(callbackCode: string) {
    if (callbackCode) {
      return true;
    }

    return false;
  }

  private isStateValid(state: string) {
    if (state) {
      if (state === this.authService.getState()) {
        return true;
      }
    }

    return false;
  }
}
