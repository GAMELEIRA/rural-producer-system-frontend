import { Component, inject } from '@angular/core';
import { LoadingService } from '../../../core/loading/loading.service';

@Component({
  selector: 'app-loading-overlay',
  templateUrl: './loading-overlay.component.html',
  styleUrl: './loading-overlay.component.scss',
})
export class LoadingOverlayComponent {
  protected readonly loading = inject(LoadingService);
}
