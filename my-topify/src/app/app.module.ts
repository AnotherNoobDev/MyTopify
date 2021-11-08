/*
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';


import { AppComponent } from './app.component';
import { AuthRedirectComponent } from './auth/auth-redirect/auth-redirect.component';
import { AuthCallbackComponent } from './auth/auth-callback/auth-callback.component';
import { GameSelectorComponent } from './game/game-selector/game-selector/game-selector.component';
import { GameLoopComponent } from './game/game-loop/game-loop.component';
import { GameOverComponent } from './game/game-over/game-over.component';
import { ChartComponent } from './chart/chart/chart.component';
import { MenuComponent } from './shared/components/menu/menu.component';
import { MenuButtonComponent } from './shared/components/menu-button/menu-button.component';
import { MenuContentComponent } from './shared/components/menu-content/menu-content.component';
import { environment } from 'src/environments/environment';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { NotificationsLibModule, NotificationsService } from 'notifications-lib';
import { AuthGuardService, AuthService, SpotifyHttpClientService, SpotifyLibModule } from 'spotify-lib';

const appRoutes: Routes = [
  { 
    path: '', 
    component: AuthRedirectComponent 
  },
  { 
    path: environment.spotifyCallBackRoute, 
    component: AuthCallbackComponent 
  },
  { 
    path: 'game/select', 
    component: GameSelectorComponent, 
    canActivate: [AuthGuardService] 
  },
  { 
    path: 'game/main', 
    component: GameLoopComponent, 
    canActivate: [AuthGuardService]
  },
  { 
    path: 'chart/view', 
    component: ChartComponent, 
    canActivate: [AuthGuardService]},
  { 
    path: '**', 
    redirectTo: ''
  }
];

@NgModule({
  declarations: [
    AppComponent,
    AuthRedirectComponent,
    AuthCallbackComponent,
    GameSelectorComponent,
    GameLoopComponent,
    GameOverComponent,
    ChartComponent,
    MenuComponent,
    MenuButtonComponent,
    MenuContentComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule.forRoot(appRoutes, { relativeLinkResolution: 'legacy' }),
    HttpClientModule,
    ScrollingModule,
    NotificationsLibModule,
    SpotifyLibModule.forRoot({
      redirectURI: environment.spotifyAuthRedirectURI,
      clientId: 'a244c732df724f7595a7c9c4604d1179',
      clientScope: 'playlist-read-private streaming user-read-email user-read-private user-top-read playlist-modify-public',
      storageKeyForCodeVerifier: 'MYT_codeVerifier',
      storageKeyForAuthToken: 'MYT_authToken',
      storageKeyForAuthTokenValidUntil: 'MYT_authTokenValidUntil',
      storageKeyForAuthRequestState: 'MYT_state'
    })
  ],
  providers: [
    NotificationsService,
    AuthService,
    AuthGuardService,
    SpotifyHttpClientService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
