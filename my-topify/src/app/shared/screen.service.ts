import { Injectable } from '@angular/core';

@Injectable({providedIn: 'root'})
export class ScreenService {

  /*
  artist icons: 160, 320, 640
  album icons: 64, 300, 640
  */

  // TODO figure image size based on canvas size
  getImageSizeForGameView() {
    return 240;
  }
}
