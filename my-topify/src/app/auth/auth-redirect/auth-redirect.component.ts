import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-auth-redirect',
  templateUrl: './auth-redirect.component.html',
  styleUrls: ['./auth-redirect.component.css']
})
export class AuthRedirectComponent implements OnInit {

  private spotifyAuthEndPoint = 'https://accounts.spotify.com/authorize';
  private clientId: string;
  private responseType = 'code';
  private state = 'e21392da45dbf4';
  private scope = 'playlist-read-private streaming user-read-email user-read-private user-top-read playlist-modify-public';
  //private scope = 'user-read-private user-read-top ';

  private codeChallengeMethod = 'S256';  
  private codeChallenge: string;

  private spotifyAuthRedirectURI = '';

  constructor(private router: Router, private authService: AuthService) {

    // we are authenticated; just navigate away
    if (authService.isAuthenticated()) {
      this.router.navigate(['auth-callback']);
    }

    // build auth request 
    this.clientId = authService.getClientId();
    this.codeChallenge = authService.getCodeChallenge();

    this.spotifyAuthRedirectURI = this.spotifyAuthEndPoint + '?'
    + 'code_challenge=' + this.codeChallenge + '&'
    + 'code_challenge_method=' + this.codeChallengeMethod + '&'
    + 'client_id=' + this.clientId + '&'
    + 'response_type=' + this.responseType + '&'
    + 'redirect_uri=' + this.authService.getRedirectURI() + '&'
    + 'state=' + this.state + '&'
    + 'scope=' + this.scope;
   }

  ngOnInit() {
  }

  redirectToSpotify() {
    window.location.href = this.spotifyAuthRedirectURI;
  }

}
