import { Injectable } from '@angular/core';

@Injectable({providedIn: 'root'})
export class ScreenService {

  /*
  artist icons: 160, 320, 640
  album icons: 64, 300, 640
  */

  // TODO (STYLE) figure image size based on canvas size
  // when this changes we need to update resource manager icons
  getImageSizeForGameView() {
    // window.innerWidth window.innerHeight
    return 240;
  }
}
