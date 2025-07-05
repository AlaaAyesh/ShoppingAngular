import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pricePipe',
  standalone: true
})
export class PricePipe implements PipeTransform {
  transform(price: number, discount: number = 0): number {
    if (!discount) return price;
    return +(price - (price * discount / 100)).toFixed(2);
  }
}
