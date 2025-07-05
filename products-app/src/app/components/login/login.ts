import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  loginData = {
    email: '',
    password: ''
  };
  
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  showPassword = false;

  constructor(private router: Router, private cartService: CartService, private userService: UserService) {}

  onSubmit(): void {
    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    // Basic validation
    if (!this.loginData.email || !this.loginData.password) {
      this.errorMessage = 'Please fill in all fields';
      this.isSubmitting = false;
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.loginData.email)) {
      this.errorMessage = 'Please enter a valid email address';
      this.isSubmitting = false;
      return;
    }

    // Password validation
    if (this.loginData.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters long';
      this.isSubmitting = false;
      return;
    }
    
    // Simulate login process
    setTimeout(() => {
      const result = this.userService.login(this.loginData.email, this.loginData.password);
      if (result.success && result.user) {
        this.successMessage = 'Login successful! Redirecting...';
        this.cartService.setUser(this.loginData.email);
        this.router.navigate(['/products']);
      } else {
        this.errorMessage = result.message;
      }
      this.isSubmitting = false;
    }, 500);
  }

  // Demo login with predefined credentials
  demoLogin(): void {
    this.loginData.email = 'demo@example.com';
    this.loginData.password = 'demo123';
    this.onSubmit();
  }
}
