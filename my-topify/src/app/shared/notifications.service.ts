import { Injectable } from '@angular/core';


export enum NotificationType {
  INFO,
  ERROR
}

export interface AppNotification {
  type: NotificationType;
  msg: string;
}

/*

    window.setTimeout(() => {
      this.notificationService.notify({type: NotificationType.ERROR, msg: 'Login failed!'});
    }, 100);

    window.setTimeout(() => {
      this.notificationService.notify({type: NotificationType.INFO, msg: 'Just a prank bro!'});
    }, 4500);

    window.setTimeout(() => {
      this.notificationService.notify({type: NotificationType.INFO, msg: 'Dont be like that!'});
    }, 9000);
*/

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
    if (this.notifications.length > 0) {
      // pop next notification
      this.activeNotification = this.notifications.shift();
      
      if (this.displayCallback) {
        this.displayCallback(this.activeNotification);
      }

    } else {
      this.activeNotification = undefined;
    }
  }

}
