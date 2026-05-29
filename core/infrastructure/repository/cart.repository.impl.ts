import { CartDatasource } from '../../domain/datasources/cart.datasource';
import { CartEntity } from '../../domain/entities/CartEntity';
import { CartRepository } from '../../domain/repositories/cart.repository';

export class CartRepositoryImpl implements CartRepository {
  constructor(private readonly datasource: CartDatasource) {}

  getCart(userId: string): Promise<CartEntity> {
    return this.datasource.getCart(userId);
  }


  addItemToCart(userId: string, productId: string, quantity: number, source: string): Promise<CartEntity> {
    return this.datasource.addItemToCart(userId, productId, quantity, source);
  }
}