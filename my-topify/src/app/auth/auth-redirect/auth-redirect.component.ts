/*
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'spotify-lib';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-auth-redirect',
  templateUrl: './auth-redirect.component.html',
  styleUrls: ['../../shared/style/common.css', './auth-redirect.component.css']
})
export class AuthRedirectComponent {

  constructor(private router: Router, private authService: AuthService) {
    // we are authenticated: just navigate to auth callback ourselves
    if (authService.isAuthenticated()) {
      this.router.navigate([environment.spotifyCallBackRoute]);
    }
   }


  redirectToSpotify(): void {
    // we need to authenticate: navigate to spotify auth page
    window.location.href = this.authService.getSpotifyAuthRedirectURI();
  }
}
