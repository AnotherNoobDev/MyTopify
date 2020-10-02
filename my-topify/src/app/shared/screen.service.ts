/*
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({providedIn: 'root'})
export class ScreenService {
  /*
  artist icons: 160, 320, 640
  album icons: 64, 300, 640
  */

  private recImgSizeSubject = new Subject<void>();
  private recommendedImageSize: number;

  constructor() {
    window.addEventListener('resize', this.onWindowResize.bind(this));

    // make sure it gets called at startup
    this.onWindowResize();
  }

  recommendedImgSizeChanged() {
    return this.recImgSizeSubject.asObservable();
  }

  private onWindowResize() {
    //console.log('window: ' + window.innerWidth + 'x' + window.innerHeight);
    this.checkImageSize();
  }


  private checkImageSize() {
    let newRecImgSize: number;

    if (window.innerWidth > 1024 || window.innerWidth > 1024) {
      newRecImgSize = 240;
    } else if (window.innerWidth > 768 || window.innerHeight > 768) {
      newRecImgSize = 180;
    } else {
      newRecImgSize = 100;
    }

    if (this.recommendedImageSize !== newRecImgSize) {

      let changed = false;
      if (this.recommendedImageSize !== undefined) {
        changed = true;
      }

      this.recommendedImageSize = newRecImgSize;
      
      if (changed) {
        this.recImgSizeSubject.next();
      }
    }
  }

  getImageSizeForGameView() {
    return this.recommendedImageSize;
  }
}
