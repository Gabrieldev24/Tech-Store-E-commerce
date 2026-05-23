import { CartEntity } from "../entities/CartEntity";


export interface CartRepository {
  getCart(userId: string): Promise<CartEntity>;
  addItemToCart(userId: string, productId: string, quantity: number): Promise<CartEntity>;
}