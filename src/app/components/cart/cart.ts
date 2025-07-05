import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../models/cart-item.interface';
import { PricePipe } from '../../pipes/price-pipe';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, PricePipe],
  templateUrl: './cart.html',
  styleUrl: './cart.css'
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  loading = true;
  totalPrice = 0;
  totalItems = 0;
  hasOutOfStockItems = false;

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.cartService.getCartItems().subscribe(items => {
      this.cartItems = items;
      this.calculateTotals();
      this.checkStockStatus();
      this.loading = false;
    });
  }

  calculateTotals(): void {
    this.totalPrice = this.cartService.getTotalPrice();
    this.totalItems = this.cartItems.reduce((total, item) => total + item.quantity, 0);
  }

  checkStockStatus(): void {
    this.hasOutOfStockItems = this.cartItems.some(item => 
      !item.product.stock || item.product.stock === 0
    );
  }

  updateQuantity(productId: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const newQuantity = parseInt(input.value);
    const item = this.cartItems.find(item => item.product.id === productId);
    if (item) {
      // Validate against stock
      if (newQuantity > item.product.stock) {
        item.quantity = item.product.stock;
      } else if (newQuantity <= 0) {
        this.removeItem(productId);
      } else {
        item.quantity = newQuantity;
      }
      this.cartService.updateQuantity(productId, item.quantity);
    }
  }

  increaseQuantity(productId: number): void {
    const item = this.cartItems.find(item => item.product.id === productId);
    if (item && item.quantity < item.product.stock) {
      item.quantity++;
      this.cartService.updateQuantity(productId, item.quantity);
    }
  }

  decreaseQuantity(productId: number): void {
    const item = this.cartItems.find(item => item.product.id === productId);
    if (item && item.quantity > 1) {
      item.quantity--;
      this.cartService.updateQuantity(productId, item.quantity);
    }
  }

  removeItem(productId: number): void {
    this.cartService.removeFromCart(productId);
  }

  clearCart(): void {
    if (confirm('Are you sure you want to clear your cart?')) {
      this.cartService.clearCart();
    }
  }

  getItemTotal(item: CartItem): number {
    return item.product.price * item.quantity;
  }

  getItemDiscountedTotal(item: CartItem): number {
    const discountedPrice = this.calculateDiscountedPrice(item.product.price, item.product.discountPercentage);
    return discountedPrice * item.quantity;
  }

  calculateDiscountedPrice(price: number, discountPercentage: number): number {
    if (!discountPercentage) return price;
    return price - (price * discountPercentage / 100);
  }

  getStockStatus(item: CartItem): { status: string; class: string } {
    if (!item.product.stock || item.product.stock === 0) {
      return { status: 'Out of Stock', class: 'out-of-stock' };
    } else if (item.quantity > item.product.stock) {
      return { status: `Only ${item.product.stock} available`, class: 'low-stock' };
    } else if (item.product.stock < 5) {
      return { status: `Only ${item.product.stock} left`, class: 'low-stock' };
    } else {
      return { status: 'In Stock', class: 'in-stock' };
    }
  }

  canCheckout(): boolean {
    return this.cartItems.length > 0 && !this.hasOutOfStockItems;
  }

  getSavings(): number {
    return this.cartItems.reduce((total, item) => {
      const originalTotal = item.product.price * item.quantity;
      const discountedTotal = this.getItemDiscountedTotal(item);
      return total + (originalTotal - discountedTotal);
    }, 0);
  }

  checkout(): void {
    if (this.canCheckout()) {
      alert('Checkout functionality would be implemented here!');
      // In a real app, this would navigate to checkout or process payment
    }
  }
}
