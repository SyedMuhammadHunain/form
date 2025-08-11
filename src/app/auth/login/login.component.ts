import { Component, DestroyRef, OnInit, inject } from '@angular/core';

import { ReactiveFormsModule, FormControl, FormGroup, Validators, AbstractControl } from '@angular/forms';

import { of } from 'rxjs';

function mustContainQuestionMark(control: AbstractControl) {
  if (control.value.includes('?')) {
    return null;
  }
  return { doesNotContainQuestionMark: true };
}

function emailIsUnique(control: AbstractControl) {
  if (control.value !== 'test@example.com') {
    return of(null);
  }

  return of({ notUnique: true });
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  private destroyRef = inject(DestroyRef);

  form = new FormGroup({
    email: new FormControl('', {
      validators: [Validators.email, Validators.required],
      asyncValidators: [emailIsUnique],
    }),
    password: new FormControl('', {
      validators: [Validators.required, Validators.minLength(6), mustContainQuestionMark],
    }),
  });

  ngOnInit() {
    const savedForm = window.localStorage.getItem('saved-login-form');
    if (savedForm) {
      const parsedForm = JSON.parse(savedForm);
      this.form.controls.email.setValue(parsedForm.email);
    }

    const subscription = this.form.valueChanges.subscribe({
      next: (val) => {
        window.localStorage.setItem('saved-login-form', JSON.stringify({ email: val.email }));
      },
    });

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }

  get emailIsInvalid() {
    return this.form.controls.email.touched && this.form.controls.email.invalid &&
      this.form.controls.email.dirty;
  }

  get passwordIsInvalid() {
    return this.form.controls.password.touched && this.form.controls.password.invalid &&
      this.form.controls.email.dirty;
  }

  onSubmit() {
    const enteredEmail = this.form.value.email;
    const enteredPassword = this.form.value.password;
    console.log(enteredEmail, enteredPassword);
  }
}