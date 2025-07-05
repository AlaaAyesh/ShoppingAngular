import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray, AbstractControl, ValidationErrors } from '@angular/forms';
import { UserService } from '../../services/user.service';

function usernameValidator(control: AbstractControl): ValidationErrors | null {
  return /\s/.test(control.value) ? { noSpaces: true } : null;
}

function passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value || '';
  const valid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@%*#$!^&+=]).{8,}$/.test(value);
  return !valid ? { weakPassword: true } : null;
}

function confirmPasswordValidator(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return password === confirm ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {
  form: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  showPassword = false;
  showConfirmPassword = false;

  get addresses(): FormArray {
    return this.form.get('addresses') as FormArray;
  }

  constructor(private fb: FormBuilder, private router: Router, private userService: UserService) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, usernameValidator]],
      password: ['', [Validators.required, passwordStrengthValidator]],
      confirmPassword: ['', Validators.required],
      addresses: this.fb.array([])
    }, { validators: confirmPasswordValidator });
  }

  addAddress(): void {
    this.addresses.push(this.fb.group({
      address: ['', Validators.required],
      street: ['', Validators.required],
      country: ['', Validators.required],
      city: ['', Validators.required]
    }));
  }

  removeAddress(index: number): void {
    this.addresses.removeAt(index);
  }

  onSubmit(): void {
    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.isSubmitting = false;
      this.errorMessage = 'Please fix the errors in the form.';
      return;
    }
    const { name, email, username, password, addresses } = this.form.value;
    const result = this.userService.register({ name, email, password, username, addresses });
    if (result.success) {
      this.successMessage = 'Registration successful! Redirecting...';
      this.router.navigate(['/products']);
    } else {
      this.errorMessage = result.message;
    }
    this.isSubmitting = false;
  }

  // Demo registration with predefined data
  demoRegister(): void {
    this.form.setValue({
      name: 'Demo User',
      email: 'demo@example.com',
      username: 'demo',
      password: 'demo123',
      confirmPassword: 'demo123',
      addresses: []
    });
    this.onSubmit();
  }
}
