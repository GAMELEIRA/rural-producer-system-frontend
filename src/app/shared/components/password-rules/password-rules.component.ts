import { Component, computed, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl } from '@angular/forms';
import { map, startWith, switchMap } from 'rxjs';
import { PASSWORD_RULES } from '../../validators/password.validators';

@Component({
  selector: 'app-password-rules',
  templateUrl: './password-rules.component.html',
  styleUrl: './password-rules.component.scss',
})
export class PasswordRulesComponent {
  readonly control = input.required<AbstractControl<string>>();

  private readonly value = toSignal(
    toObservable(this.control).pipe(
      switchMap((c) => c.valueChanges.pipe(startWith(c.value))),
      map((v) => v ?? ''),
    ),
    { initialValue: '' },
  );

  readonly rules = computed(() =>
    PASSWORD_RULES.map((rule) => ({ label: rule.label, ok: rule.test(this.value()) })),
  );
}
