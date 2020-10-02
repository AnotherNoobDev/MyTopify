/*
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-auth-redirect',
  templateUrl: './auth-redirect.component.html',
  styleUrls: ['../../shared/style/common.css', './auth-redirect.component.css']
})
export class AuthRedirectComponent implements OnInit {

  private spotifyAuthEndPoint = 'https://accounts.spotify.com/authorize';
  private responseType = 'code';
  private scope = 'playlist-read-private streaming user-read-email user-read-private user-top-read playlist-modify-public';

  private codeChallengeMethod = 'S256';  

  constructor(private router: Router, private authService: AuthService) {
    // we are authenticated; just navigate away
    if (authService.isAuthenticated()) {
      this.router.navigate([environment.spotifyAuthRedirectURI.substring(environment.spotifyAuthRedirectURI.lastIndexOf('/') + 1)]);
    }
   }

  ngOnInit() {
  }

  redirectToSpotify() {
    // build auth request 
    const spotifyAuthRedirectURI = this.spotifyAuthEndPoint + '?'
    + 'code_challenge=' + this.authService.getCodeChallenge() + '&'
    + 'code_challenge_method=' + this.codeChallengeMethod + '&'
    + 'client_id=' + this.authService.getClientId() + '&'
    + 'response_type=' + this.responseType + '&'
    + 'redirect_uri=' + this.authService.getRedirectURI() + '&'
    + 'state=' + this.authService.generateState() + '&'
    + 'scope=' + this.scope;

    // redirect
    window.location.href = spotifyAuthRedirectURI;
  }

}
