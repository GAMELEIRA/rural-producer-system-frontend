import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../../core/auth/auth.service';
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

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

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

    this.loading.set(true);
    this.error.set(null);

    const { confirmPassword: _confirm, ...payload } = this.form.getRawValue();

    this.auth.register(payload).subscribe({
      next: () => void this.router.navigate(['/auth/login'], { queryParams: { registered: 1 } }),
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.error.set(
          err.status === 409
            ? 'Já existe uma conta com este e-mail.'
            : 'Não foi possível criar sua conta. Tente novamente.',
        );
      },
    });
  }
}
