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

const appRoutes: Routes = [
  { path: '', component: AuthRedirectComponent },
  { path: 'auth-callback', component: AuthCallbackComponent },
  { path: 'game/select', component: GameSelectorComponent },
  { path: 'game/main', component: GameLoopComponent}
];

@NgModule({
  declarations: [
    AppComponent,
    AuthRedirectComponent,
    AuthCallbackComponent,
    GameSelectorComponent,
    GameLoopComponent,
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
