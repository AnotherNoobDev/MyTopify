/*
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, SpotifyHttpClientService } from 'spotify-lib';
import { NotificationPriority, NotificationsService, NotificationType } from 'notifications-lib';

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

    // check error state
    const error: string = this.route.snapshot.queryParams.error;

    if (error) {
      this.notificationService.notify({
        type: NotificationType.ERROR, 
        msg: 'Login failed. Reason: ' + error, 
        priority: NotificationPriority.STANDARD
      });
      this.router.navigate(['']);
      return;
    }

    // extract and verify callback code and state
    const callbackCode: string = this.route.snapshot.queryParams.code;
    const state: string = this.route.snapshot.queryParams.state;

    if (!this.isCallbackCodeValid(callbackCode) ||
        !this.isStateValid(state)) {
          this.router.navigate(['']);
          return;
    }

    // get code verifier
    const codeVerifier = this.authService.getCodeVerifier();

    if (!codeVerifier) {
      this.notificationService.notify({
        type: NotificationType.ERROR, 
        msg: 'Login failed.',
        priority: NotificationPriority.STANDARD
      });
      this.router.navigate(['']);
      return;
    }

    // we have everything we need, make access token request and finalize auth
    this.spotifyHttpClient.getAccessToken({
      clientId: this.authService.getClientId(), 
      codeVerifier,
      code: callbackCode, 
      redirectURI: this.authService.getRedirectURI()})
        .subscribe(responseData => {
          const success = this.authService.authenticate(responseData);

          if (!success) {
            this.notificationService.notify({
              type: NotificationType.ERROR, 
              msg: 'Login failed.',
              priority: NotificationPriority.STANDARD
            });
            this.router.navigate(['']);
          }
        }, 
        err => {
          this.notificationService.notify({
            type: NotificationType.ERROR, 
            msg: 'Failed to obtain authentication token.',
            priority: NotificationPriority.STANDARD
          });

          this.router.navigate(['']);
        });
  }


  private isCallbackCodeValid(callbackCode: string): boolean {
    if (callbackCode) {
      return true;
    }

    return false;
  }


  private isStateValid(state: string): boolean {
    if (state) {
      if (state === this.authService.getState()) {
        return true;
      }
    }

    return false;
  }
}
