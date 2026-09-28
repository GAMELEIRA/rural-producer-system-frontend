import { Component, inject } from '@angular/core';
import { ConfirmService } from '../../../core/notifications/confirm.service';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss',
  host: { '(document:keydown.escape)': 'confirm.current() && confirm.answer(false)' },
})
export class ConfirmDialogComponent {
  protected readonly confirm = inject(ConfirmService);
}
