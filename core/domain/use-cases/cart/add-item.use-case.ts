import { CartEntity } from '../../entities/CartEntity';
import { CartRepository } from '../../repositories/cart.repository';

export class AddItemToCart {
  constructor(private readonly repository: CartRepository) {}

  // 1. Agregamos el parámetro source
  public async execute(userId: string, productId: string, quantity: number, source: string): Promise<CartEntity> {
    // 2. Se lo pasamos al repositorio
    return await this.repository.addItemToCart(userId, productId, quantity, source);
  }
}