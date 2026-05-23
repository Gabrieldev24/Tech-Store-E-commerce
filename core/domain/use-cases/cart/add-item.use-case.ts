import { CartEntity } from '../../entities/CartEntity';
import { CartRepository } from '../../repositories/cart.repository';


export class AddItemToCart {
  constructor(private readonly repository: CartRepository) {}

  public async execute(userId: string, productId: string, quantity: number): Promise<CartEntity> {
    return await this.repository.addItemToCart(userId, productId, quantity);
  }
}