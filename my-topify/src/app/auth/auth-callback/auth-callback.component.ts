import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth.service';
import { SpotifyHttpClientService } from 'src/app/shared/spotify-http-client.service';

@Component({
  selector: 'app-auth-callback',
  templateUrl: './auth-callback.component.html',
  styleUrls: ['../../shared/style/common.css', './auth-callback.component.css']
})
export class AuthCallbackComponent implements OnInit { 
  constructor(private route: ActivatedRoute,
              private spotifyHttpClient: SpotifyHttpClientService,
              private authService: AuthService) { 
              }

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      console.log('Already authenticated');
      return;
    }

    const callbackCode: string = this.route.snapshot.queryParams.code;
    const state: string = this.route.snapshot.queryParams.state;

    // TODO check state matches request state
    console.log(state);

    this.spotifyHttpClient.getAccessToken({
      clientId: this.authService.getClientId(), 
      codeVerifier: this.authService.getCodeVerifier(), 
      code: callbackCode, 
      redirectURI: this.authService.getRedirectURI()})
        .subscribe(responseData => {
          this.authService.authenticate(responseData);
        });
  }
}
