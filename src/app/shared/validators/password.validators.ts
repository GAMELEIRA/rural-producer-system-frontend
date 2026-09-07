import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export interface PasswordRule {
  label: string;
  regex: RegExp;
  test: (value: string) => boolean;
}

const rule = (label: string, regex: RegExp): PasswordRule => ({
  label,
  regex,
  test: (value) => regex.test(value),
});

/** Regras exibidas na UI e aplicadas por `passwordStrengthValidator`. */
export const PASSWORD_RULES: readonly PasswordRule[] = [
  rule('Pelo menos 8 caracteres', /^.{8,}$/),
  rule('Pelo menos uma letra', /[A-Za-z]/),
  rule('Pelo menos um número', /\d/),
];

export const passwordStrengthValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const value: string = control.value ?? '';
  if (!value) return null;
  return PASSWORD_RULES.every((r) => r.test(value)) ? null : { passwordStrength: true };
};

export function passwordMatchValidator(passwordKey: string, confirmKey: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const password = group.get(passwordKey);
    const confirm = group.get(confirmKey);
    if (!password || !confirm) return null;

    const mismatch = password.value !== confirm.value;
    const otherErrors = { ...(confirm.errors ?? {}) };
    delete otherErrors['passwordMismatch'];

    confirm.setErrors(
      mismatch
        ? { ...otherErrors, passwordMismatch: true }
        : Object.keys(otherErrors).length
          ? otherErrors
          : null,
    );

    return mismatch ? { passwordMismatch: true } : null;
  };
}
