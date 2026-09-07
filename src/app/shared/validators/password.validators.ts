import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Mínimo 8 caracteres, com letra e número. */
export const passwordStrengthValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const value: string = control.value ?? '';
  if (!value) return null;
  const valid = value.length >= 8 && /[A-Za-z]/.test(value) && /\d/.test(value);
  return valid ? null : { passwordStrength: true };
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
