import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Aceita "00000000000" ou "000.000.000-00" (mesma regra do backend). */
export const CPF_REGEX = /(^\d{11}$)|(^\d{3}\.\d{3}\.\d{3}-\d{2}$)/;

/** Valida formato e dígitos verificadores do CPF. Vazio é tratado por `Validators.required`. */
export const cpfValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value: string = control.value ?? '';
  if (!value) return null;
  if (!CPF_REGEX.test(value) || !hasValidCheckDigits(value.replace(/\D/g, ''))) {
    return { cpf: true };
  }
  return null;
};

function hasValidCheckDigits(digits: string): boolean {
  if (/^(\d)\1{10}$/.test(digits)) return false;
  const calc = (len: number) => {
    const sum = digits
      .slice(0, len)
      .split('')
      .reduce((acc, d, i) => acc + Number(d) * (len + 1 - i), 0);
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };
  return calc(9) === Number(digits[9]) && calc(10) === Number(digits[10]);
}
