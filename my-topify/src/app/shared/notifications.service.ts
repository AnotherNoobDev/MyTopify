/*
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import { Injectable } from '@angular/core';

export enum NotificationType {
  INFO,
  ERROR
}

export interface AppNotification {
  type: NotificationType;
  msg: string;
}

@Injectable({providedIn: 'root'})
export class NotificationsService {

  private notifications: AppNotification[] = [];
  private activeNotification: AppNotification = undefined;
  
  private displayCallback: (notification: AppNotification) => void;

  registerDisplayCallback(callback: (notification: AppNotification) => void) {
    this.displayCallback = callback;
  }

  /**
   * push a notification, to be displayed 
   */
  notify(notification: AppNotification) {
    if (this.activeNotification) {
      this.notifications.push(notification);
    } else {
      this.activeNotification = notification;
      
      if (this.displayCallback) {
        this.displayCallback(this.activeNotification);
      }
    }
  }

  /**
   * dismiss active notification
   */
  dismiss() {
    if (this.notifications.length === 0) {
      this.activeNotification = undefined;
      return;
    }

    // get next notification that is different from active one
    let nextNotification = this.notifications.shift();
    let display = false;

    while (this.notifications.length > 0) {
      if (!this.isNextNotificationTheSame(nextNotification)) {
        display = true;
        break;
      }

      nextNotification = this.notifications.shift();
    }

    if (!display) {
      this.activeNotification = undefined;
      return;
    }

    this.activeNotification = nextNotification;
    
    if (this.displayCallback) {
      this.displayCallback(this.activeNotification);
    }
  }

  private isNextNotificationTheSame(nextNotification: AppNotification) {
    if (this.activeNotification.type === nextNotification.type &&
        this.activeNotification.msg === nextNotification.msg) {
          return true;
        }

    return false;
  }

}
