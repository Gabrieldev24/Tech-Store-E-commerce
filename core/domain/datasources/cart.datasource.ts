import { CartEntity } from "../entities/CartEntity";


export interface CartDatasource {
  getCart(userId: string): Promise<CartEntity>;
  addItemToCart(userId: string, productId: string, quantity: number,source: string): Promise<CartEntity>;
  removeItemFromCart(userId: string, productId: string): Promise<CartEntity>;
  updateItemQuantity(userId: string, productId: string, quantity: number): Promise<CartEntity>;
}