import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Product, ProductsResponse } from '../models/product.interface';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private baseUrl = 'https://dummyjson.com';

  constructor(private http: HttpClient) { }

  getProducts(limit: number = 100, skip: number = 0): Observable<Product[]> {
    const params = new HttpParams()
      .set('limit', limit.toString())
      .set('skip', skip.toString());
    
    return this.http.get<ProductsResponse>(`${this.baseUrl}/products`, { params })
      .pipe(map(response => response.products));
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/products/${id}`);
  }
} 