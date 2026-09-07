import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { FormFieldComponent } from '../../../../shared/components/form-field/form-field.component';

@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule, RouterLink, FormFieldComponent],
  templateUrl: './forgot-password.component.html',
  styleUrl: '../auth-page.scss',
})
export class ForgotPasswordComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly auth = inject(AuthService);

  readonly loading = signal(false);
  readonly sent = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.auth.forgotPassword(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading.set(false);
        this.sent.set(true);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Não foi possível enviar o e-mail. Tente novamente.');
      },
    });
  }
}
