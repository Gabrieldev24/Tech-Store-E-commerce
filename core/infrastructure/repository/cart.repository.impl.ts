import { CartRepository } from '../../domain/repositories/cart.repository';
import { CartDatasource } from '../../domain/datasources/cart.datasource';
import { CartEntity } from '@/core/domain/entities/CartEntity';


export class CartRepositoryImpl implements CartRepository {
  constructor(private readonly datasource: CartDatasource) {}

  getCart(userId: string): Promise<CartEntity> {
    return this.datasource.getCart(userId);
  }

  addItemToCart(userId: string, productId: string, quantity: number): Promise<CartEntity> {
    return this.datasource.addItemToCart(userId, productId, quantity);
  }
}