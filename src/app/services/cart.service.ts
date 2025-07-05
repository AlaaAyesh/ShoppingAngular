import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CartItem } from '../models/cart-item.interface';
import { Product } from '../models/product.interface';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems: CartItem[] = [];
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  private userEmail: string | null = null;

  constructor() {
    this.setUserFromStorage();
    this.loadCartFromStorage();
  }

  setUser(email: string | null): void {
    this.userEmail = email;
    this.loadCartFromStorage();
  }

  private setUserFromStorage(): void {
    this.userEmail = localStorage.getItem('userEmail');
  }

  getCartItems(): Observable<CartItem[]> {
    return this.cartSubject.asObservable();
  }

  getCartCount(): Observable<number> {
    return new Observable(observer => {
      this.cartSubject.subscribe(items => {
        const count = items.reduce((total, item) => total + item.quantity, 0);
        observer.next(count);
      });
    });
  }

  addToCart(product: Product): void {
    const existingItem = this.cartItems.find(item => item.product.id === product.id);
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        existingItem.quantity++;
      }
    } else {
      this.cartItems.push({ product, quantity: 1 });
    }
    this.updateCart();
  }

  removeFromCart(productId: number): void {
    this.cartItems = this.cartItems.filter(item => item.product.id !== productId);
    this.updateCart();
  }

  updateQuantity(productId: number, quantity: number): void {
    const item = this.cartItems.find(item => item.product.id === productId);
    if (item) {
      if (quantity <= 0) {
        this.removeFromCart(productId);
      } else if (quantity <= item.product.stock) {
        item.quantity = quantity;
        this.updateCart();
      }
    }
  }

  increaseQuantity(productId: number): void {
    const item = this.cartItems.find(item => item.product.id === productId);
    if (item && item.quantity < item.product.stock) {
      item.quantity++;
      this.updateCart();
    }
  }

  decreaseQuantity(productId: number): void {
    const item = this.cartItems.find(item => item.product.id === productId);
    if (item) {
      if (item.quantity > 1) {
        item.quantity--;
        this.updateCart();
      } else {
        this.removeFromCart(productId);
      }
    }
  }

  clearCart(): void {
    this.cartItems = [];
    this.updateCart();
  }

  getTotalPrice(): number {
    return this.cartItems.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  }

  isInCart(productId: number): boolean {
    return this.cartItems.some(item => item.product.id === productId);
  }

  getCartQuantity(productId: number): number {
    const item = this.cartItems.find(item => item.product.id === productId);
    return item ? item.quantity : 0;
  }

  private updateCart(): void {
    this.cartSubject.next([...this.cartItems]);
    this.saveCartToStorage();
  }

  private getCartKey(): string {
    return this.userEmail ? `cart_${this.userEmail}` : 'cart_guest';
  }

  private saveCartToStorage(): void {
    const key = this.getCartKey();
    localStorage.setItem(key, JSON.stringify(this.cartItems));
  }

  private loadCartFromStorage(): void {
    const key = this.getCartKey();
    const savedCart = localStorage.getItem(key);
    if (savedCart) {
      this.cartItems = JSON.parse(savedCart);
    } else {
      this.cartItems = [];
    }
    this.cartSubject.next([...this.cartItems]);
  }

  logout(): void {
    this.userEmail = null;
    this.cartItems = [];
    this.cartSubject.next([]);
  }
} 