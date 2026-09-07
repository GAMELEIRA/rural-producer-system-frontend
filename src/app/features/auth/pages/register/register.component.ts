import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { NotificationService } from '../../../../core/notifications/notification.service';
import { FormFieldComponent } from '../../../../shared/components/form-field/form-field.component';
import {
  passwordMatchValidator,
  passwordStrengthValidator,
} from '../../../../shared/validators/password.validators';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink, FormFieldComponent],
  templateUrl: './register.component.html',
  styleUrl: '../auth-page.scss',
})
export class RegisterComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notifications = inject(NotificationService);

  readonly submitting = signal(false);

  readonly form = this.fb.group(
    {
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(60)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(60)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, passwordStrengthValidator]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordMatchValidator('password', 'confirmPassword') },
  );

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);

    const { confirmPassword: _confirm, ...payload } = this.form.getRawValue();

    this.auth.register(payload).subscribe({
      next: () => {
        this.notifications.success('Conta criada com sucesso!');
        void this.router.navigate(['/auth/login'], { queryParams: { registered: 1 } });
      },
      error: () => this.submitting.set(false),
    });
  }
}
