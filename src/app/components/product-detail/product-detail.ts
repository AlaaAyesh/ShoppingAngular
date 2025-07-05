import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product.interface';
import { PricePipe } from '../../pipes/price-pipe';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, PricePipe],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css'
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  product: Product | null = null;
  loading = true;
  error = '';
  
  // Image gallery
  selectedImageIndex = 0;
  
  // Quantity management
  quantity = 1;
  
  // Related products (simulated)
  relatedProducts: Product[] = [];

  private routeSub: Subscription | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.routeSub = this.route.paramMap.subscribe(() => {
      this.selectedImageIndex = 0;
      this.quantity = 1;
      this.loadProduct();
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  loadProduct(): void {
    const productId = this.route.snapshot.paramMap.get('id');
    
    if (!productId) {
      this.error = 'Product ID not found';
      this.loading = false;
      return;
    }

    this.loading = true;
    this.error = '';

    this.productService.getProductById(parseInt(productId)).subscribe({
      next: (product) => {
        this.product = product;
        this.loadRelatedProducts();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load product. Please try again.';
        this.loading = false;
        console.error('Error loading product:', err);
      }
    });
  }

  loadRelatedProducts(): void {
    // Simulate loading related products from the same category
    if (this.product) {
      this.productService.getProducts(100).subscribe({
        next: (products) => {
          this.relatedProducts = products
            .filter(p => p.category === this.product?.category && p.id !== this.product?.id)
            .slice(0, 4);
        }
      });
    }
  }

  selectImage(index: number): void {
    this.selectedImageIndex = index;
  }

  nextImage(): void {
    if (this.product && this.product.images.length > 0) {
      this.selectedImageIndex = (this.selectedImageIndex + 1) % this.product.images.length;
    }
  }

  previousImage(): void {
    if (this.product && this.product.images.length > 0) {
      this.selectedImageIndex = this.selectedImageIndex === 0 
        ? this.product.images.length - 1 
        : this.selectedImageIndex - 1;
    }
  }

  increaseQuantity(): void {
    if (this.product && this.quantity < this.product.stock) {
      this.quantity++;
    }
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  updateQuantity(event: Event): void {
    const input = event.target as HTMLInputElement;
    const newQuantity = parseInt(input.value);
    
    if (this.product && !isNaN(newQuantity)) {
      if (newQuantity <= 0) {
        this.quantity = 1;
      } else if (newQuantity > this.product.stock) {
        this.quantity = this.product.stock;
      } else {
        this.quantity = newQuantity;
      }
    }
  }

  addToCart(): void {
    if (this.product && this.product.stock > 0) {
      // Add the specified quantity to cart
      for (let i = 0; i < this.quantity; i++) {
        this.cartService.addToCart(this.product);
      }
      
      // Show success message (in a real app, you'd use a toast notification)
      alert(`Added ${this.quantity} ${this.quantity === 1 ? 'item' : 'items'} to cart!`);
    }
  }

  isInCart(): boolean {
    return this.product ? this.cartService.isInCart(this.product.id) : false;
  }

  getCartQuantity(): number {
    return this.product ? this.cartService.getCartQuantity(this.product.id) : 0;
  }

  removeFromCart(): void {
    if (this.product) {
      this.cartService.removeFromCart(this.product.id);
    }
  }

  getStockStatus(): { status: string; class: string; icon: string } {
    if (!this.product) {
      return { status: 'Unknown', class: 'unknown', icon: '❓' };
    }

    if (!this.product.stock || this.product.stock === 0) {
      return { status: 'Out of Stock', class: 'out-of-stock', icon: '❌' };
    } else if (this.product.stock < 5) {
      return { status: `Only ${this.product.stock} left`, class: 'low-stock', icon: '⚠️' };
    } else {
      return { status: 'In Stock', class: 'in-stock', icon: '✅' };
    }
  }

  getDiscountAmount(): number {
    if (!this.product || !this.product.discountPercentage) return 0;
    return (this.product.price * this.product.discountPercentage) / 100;
  }

  getSavings(): number {
    return this.getDiscountAmount() * this.quantity;
  }

  getRatingStars(): number[] {
    if (!this.product) return [];
    return Array.from({ length: 5 }, (_, i) => i + 1);
  }

  getFilledStars(): number {
    return this.product ? Math.floor(this.product.rating) : 0;
  }

  hasHalfStar(): boolean {
    if (!this.product) return false;
    return this.product.rating % 1 !== 0;
  }

  navigateToProduct(productId: number): void {
    this.router.navigate(['/products', productId]);
  }

  goBack(): void {
    this.router.navigate(['/products']);
  }

  getReviewCount(): number {
    return Math.floor(Math.random() * 1000) + 100;
  }
}
