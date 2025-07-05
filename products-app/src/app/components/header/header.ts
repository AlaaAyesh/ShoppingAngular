import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { UserService, User } from '../../services/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class HeaderComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  user: User | null = null;
  private loginSub: Subscription | undefined;

  constructor(private cartService: CartService, private userService: UserService, private router: Router) {}
  
  get cartCount$() {
    return this.cartService.getCartCount();
  }

  ngOnInit(): void {
    this.loginSub = this.userService.loginState$.subscribe(user => {
      this.user = user;
      this.isLoggedIn = !!user;
    });
  }

  ngOnDestroy(): void {
    this.loginSub?.unsubscribe();
  }

  logout(): void {
    this.userService.logout();
    this.cartService.logout();
    this.isLoggedIn = false;
    this.user = null;
    this.router.navigate(['/products']);
  }
}
