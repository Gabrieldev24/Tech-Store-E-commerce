
import { prisma } from '@/lib/data/postgres';
import { CartDatasource } from '../../domain/datasources/cart.datasource';
import { CartEntity, CartItemEntity } from '@/core/domain/entities/CartEntity';


export class PostgresCartDatasourceImpl implements CartDatasource {
  
  async getCart(userId: string): Promise<CartEntity> {
    const userIdInt = parseInt(userId);

    // 1. Buscamos el carrito incluyendo los items adentro
    let cart = await prisma.cart.findUnique({
      where: { userId: userIdInt },
      include: { items: true }
    });

    // 2. Si es un usuario nuevo y no tiene carrito, se lo creamos vacío
    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: userIdInt },
        include: { items: true }
      });
    }

    // 3. Mapeamos a nuestras entidades limpias
    const items = cart.items.map(item => 
      new CartItemEntity(item.id.toString(), item.productId.toString(), item.quantity)
    );

    return new CartEntity(cart.id.toString(), cart.userId.toString(), items);
  }

  async addItemToCart(userId: string, productId: string, quantity: number): Promise<CartEntity> {
    const userIdInt = parseInt(userId);
    const productIdInt = parseInt(productId);

    // 1. Asegurarnos de que el carrito exista
    let cart = await prisma.cart.findUnique({ where: { userId: userIdInt } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId: userIdInt } });
    }

    // 2. Verificar si el producto ya está en el carrito
    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId: productIdInt }
    });

    if (existingItem) {
      // Si ya existe, le sumamos la cantidad (ej. si le da 2 veces a "Agregar")
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity }
      });
    } else {
      // Si no existe, creamos el nuevo item
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId: productIdInt, quantity }
      });
    }

    // 3. Retornamos el carrito actualizado
    return this.getCart(userId);
  }
}