import { CartRepository } from '../../repositories/cart.repository';
import { CartEntity } from '../../entities/CartEntity';

export class GetCart {
  constructor(private readonly repository: CartRepository) {}

  public async execute(userId: string): Promise<CartEntity> {
    return await this.repository.getCart(userId);
  }
}