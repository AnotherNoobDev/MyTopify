import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { SpotifyHttpClientService } from 'src/app/shared/spotify-http-client.service';

@Component({
  selector: 'app-auth-callback',
  templateUrl: './auth-callback.component.html',
  styleUrls: ['./auth-callback.component.css']
})
export class AuthCallbackComponent implements OnInit { 
  constructor(private route: ActivatedRoute,
              private spotifyHttpClient: SpotifyHttpClientService,
              private router: Router,
              private authService: AuthService) { 
              }

  ngOnInit() {

    if (this.authService.isAuthenticated()) {
      //TODO autonavigate to game-selector page
      console.log('Already authenticated');
      return;
    }

    console.log(this.route.snapshot.queryParams);

    const code: string = this.route.snapshot.queryParams.code;
    const state: string = this.route.snapshot.queryParams.state;

    // TODO check state matches request state
    console.log(code);
    console.log(state);

    this.spotifyHttpClient.getAccessToken(
      this.authService.getClientId(), 
      this.authService.getCodeVerifier(), 
      code, 
      this.authService.getRedirectURI()).subscribe(responseData => {
        console.log(responseData);
        this.authService.authenticate(responseData);
    });
  }

  onProceed() {
    //TODO autonavigate to game-selector page
    //this.router.navigate(['main']);
  }
}
