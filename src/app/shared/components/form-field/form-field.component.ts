import { Component, input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

const MESSAGES: Record<string, (err: unknown) => string> = {
  required: () => 'Campo obrigatório.',
  email: () => 'Informe um e-mail válido.',
  minlength: (err) => `Mínimo de ${(err as { requiredLength: number }).requiredLength} caracteres.`,
  maxlength: (err) => `Máximo de ${(err as { requiredLength: number }).requiredLength} caracteres.`,
  passwordStrength: () => 'A senha deve ter ao menos 8 caracteres, com letras e números.',
  passwordMismatch: () => 'As senhas não coincidem.',
};

@Component({
  selector: 'app-form-field',
  templateUrl: './form-field.component.html',
  styleUrl: './form-field.component.scss',
})
export class FormFieldComponent {
  readonly label = input.required<string>();
  readonly control = input.required<AbstractControl>();
  readonly forId = input<string>();

  get showError(): boolean {
    const c = this.control();
    return c.invalid && (c.touched || c.dirty);
  }

  get errorMessage(): string | null {
    const errors = this.control().errors;
    if (!errors) return null;
    const key = Object.keys(errors)[0];
    return MESSAGES[key]?.(errors[key]) ?? 'Valor inválido.';
  }
}
