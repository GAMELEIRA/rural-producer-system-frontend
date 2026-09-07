import { Component, computed, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, ValidationErrors, Validators } from '@angular/forms';
import { map, startWith, switchMap } from 'rxjs';

const MESSAGES: Record<string, (err: unknown) => string> = {
  required: () => 'Este campo é obrigatório.',
  email: () => 'Informe um e-mail válido (ex.: nome@dominio.com).',
  minlength: (err) => `Mínimo de ${(err as { requiredLength: number }).requiredLength} caracteres.`,
  maxlength: (err) => `Máximo de ${(err as { requiredLength: number }).requiredLength} caracteres.`,
  pattern: () => 'Formato inválido.',
  passwordStrength: () => 'A senha deve ter ao menos 8 caracteres, com letras e números.',
  passwordMismatch: () => 'As senhas não coincidem.',
};

interface ControlState {
  invalid: boolean;
  touched: boolean;
  dirty: boolean;
  errors: ValidationErrors | null;
}

@Component({
  selector: 'app-form-field',
  templateUrl: './form-field.component.html',
  styleUrl: './form-field.component.scss',
})
export class FormFieldComponent {
  readonly label = input.required<string>();
  readonly control = input.required<AbstractControl>();
  readonly forId = input<string>();
  /** Texto de ajuda exibido abaixo do campo enquanto não há erro. */
  readonly hint = input<string>();

  readonly required = computed(() => this.control().hasValidator(Validators.required));

  private readonly state = toSignal(
    toObservable(this.control).pipe(
      switchMap((control) =>
        control.events.pipe(
          startWith(null),
          map((): ControlState => ({
            invalid: control.invalid,
            touched: control.touched,
            dirty: control.dirty,
            errors: control.errors,
          })),
        ),
      ),
    ),
  );

  private readonly interacted = computed(() => {
    const s = this.state();
    return !!s && (s.touched || s.dirty);
  });

  readonly showError = computed(() => this.interacted() && !!this.state()?.invalid);
  readonly showValid = computed(() => this.interacted() && !this.state()?.invalid);

  readonly errorMessage = computed(() => {
    const errors = this.state()?.errors;
    if (!errors) return null;
    const key = Object.keys(errors)[0];
    return MESSAGES[key]?.(errors[key]) ?? 'Valor inválido.';
  });
}
