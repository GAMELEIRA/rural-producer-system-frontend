import { Component, inject } from '@angular/core';
import { NotificationService } from '../../../core/notifications/notification.service';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
})
export class ToastComponent {
  protected readonly notifications = inject(NotificationService);
}
