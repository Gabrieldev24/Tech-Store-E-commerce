import { CartEntity } from "../entities/CartEntity";


export interface CartDatasource {
  getCart(userId: string): Promise<CartEntity>;
  addItemToCart(userId: string, productId: string, quantity: number,source: string): Promise<CartEntity>;
}