import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface User {
  name: string;
  email: string;
  username: string;
  passwordHash: string;
  addresses?: any[];
  isAdmin?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private usersKey = 'users';
  private sessionKey = 'sessionUser';
  private loginStateSubject = new BehaviorSubject<User | null>(this.getCurrentUser());
  loginState$: Observable<User | null> = this.loginStateSubject.asObservable();

  constructor() {
    // Seed an admin user for demo
    if (!this.getUserByEmail('admin@example.com')) {
      this.register({
        name: 'Admin',
        email: 'admin@example.com',
        username: 'admin',
        password: 'admin123',
        addresses: [],
        isAdmin: true
      });
    }
  }

  private hashPassword(password: string): string {
    // Simple hash for demo (not secure for production)
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      hash = ((hash << 5) - hash) + password.charCodeAt(i);
      hash |= 0;
    }
    return hash.toString();
  }

  getAllUsers(): User[] {
    const users = localStorage.getItem(this.usersKey);
    return users ? JSON.parse(users) : [];
  }

  getUserByEmail(email: string): User | undefined {
    return this.getAllUsers().find(u => u.email === email);
  }

  register({ name, email, username, password, addresses = [], isAdmin = false }: { name: string; email: string; username: string; password: string; addresses?: any[]; isAdmin?: boolean }): { success: boolean; message: string } {
    const users = this.getAllUsers();
    if (users.find(u => u.email === email)) {
      return { success: false, message: 'Email already registered.' };
    }
    if (users.find(u => u.username === username)) {
      return { success: false, message: 'Username already taken.' };
    }
    const passwordHash = this.hashPassword(password);
    users.push({ name, email, username, passwordHash, addresses, isAdmin });
    localStorage.setItem(this.usersKey, JSON.stringify(users));
    // Auto-login after registration
    const user = { name, email, username, passwordHash, addresses, isAdmin };
    localStorage.setItem(this.sessionKey, JSON.stringify(user));
    this.loginStateSubject.next(user);
    return { success: true, message: 'Registration successful.' };
  }

  login(email: string, password: string): { success: boolean; message: string; user?: User } {
    const user = this.getUserByEmail(email);
    if (!user) {
      return { success: false, message: 'User not found.' };
    }
    if (user.passwordHash !== this.hashPassword(password)) {
      return { success: false, message: 'Incorrect password.' };
    }
    localStorage.setItem(this.sessionKey, JSON.stringify(user));
    this.loginStateSubject.next(user);
    return { success: true, message: 'Login successful.', user };
  }

  logout(): void {
    localStorage.removeItem(this.sessionKey);
    this.loginStateSubject.next(null);
  }

  getCurrentUser(): User | null {
    const user = localStorage.getItem(this.sessionKey);
    return user ? JSON.parse(user) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getCurrentUser();
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return !!user && !!user.isAdmin;
  }
} 