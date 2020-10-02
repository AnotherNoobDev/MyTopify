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
import { NotificationsComponent } from './shared/components/notifications/notifications.component';
import { AuthGuardService } from './auth/auth-guard.service';
import { environment } from 'src/environments/environment';

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
    MenuContentComponent,
    NotificationsComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule.forRoot(appRoutes),
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
