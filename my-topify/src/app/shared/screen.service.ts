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

  private narrowScreenSubject = new Subject<boolean>();
  private narrowScreen: boolean;

  constructor() {
    window.addEventListener('resize', this.onWindowResize.bind(this));

    // make sure it gets called at startup
    this.onWindowResize();
  }

  recommendedImgSizeChanged() {
    return this.recImgSizeSubject.asObservable();
  }

  screenIsNarrowChanged() {
    return this.narrowScreenSubject.asObservable();
  }

  private onWindowResize() {
    //console.log('window: ' + window.innerWidth + 'x' + window.innerHeight);

    this.checkIfScreenIsNarrow();

    this.checkImageSize();
  }

  
  private checkIfScreenIsNarrow() {
    let narrow =  false;

    if (window.innerWidth < 400) {
      narrow = true;
    }

    if (this.narrowScreen !== narrow) {

      let changed = false;

      if (this.narrowScreen !== undefined) {
        changed = true;
      }

      this.narrowScreen = narrow;
      
      if (changed) {
        this.narrowScreenSubject.next(this.narrowScreen);
      }
    }
  }

  private checkImageSize() {
    let newRecImgSize: number;

    if (window.innerWidth > 1024 && window.innerHeight > 900) {
      newRecImgSize = 240;
    } else if (window.innerWidth > 768 && window.innerHeight > 700) {
      newRecImgSize = 180;
    } else {
      newRecImgSize = 120;
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

  isNarrowScreen() {
    return this.narrowScreen;
  }
}
