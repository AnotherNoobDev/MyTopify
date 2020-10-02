/*
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import { Component, OnInit } from '@angular/core';
import { NotificationsService, AppNotification, NotificationType } from '../../notifications.service';

const NOTIFICATION_TIMEOUT_MS = 5000;

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['../../style/common.css', './notifications.component.css']
})
export class NotificationsComponent implements OnInit {

  private notification: AppNotification;

  public display = false;
  public displayMessage = '';
  public displayAs: 'info' | 'error';

  private notificationTimeout: number;
  
  constructor(private notifications: NotificationsService) {
  }

  ngOnInit() {
    this.notifications.registerDisplayCallback(this.onNotification.bind(this));
  }

  onNotification(notification: AppNotification) {
    this.notification = notification;

    switch (this.notification.type) {
      case NotificationType.INFO:
        this.displayAs = 'info';
        break;

      case NotificationType.ERROR:
        this.displayAs = 'error';
        break;
    }

    this.displayMessage = this.notification.msg;

    this.display = true;

    if (this.notificationTimeout) {
      window.clearTimeout(this.notificationTimeout);
    }

    this.notificationTimeout = window.setTimeout(() => {
      this.onDismissNotification();
    }, NOTIFICATION_TIMEOUT_MS);
  }

  onDismissNotification() {
    this.display = false;

    window.clearTimeout(this.notificationTimeout);
    this.notificationTimeout = undefined;

    this.notifications.dismiss();
  }

}
