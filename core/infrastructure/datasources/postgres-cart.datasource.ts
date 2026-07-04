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
    // (Nota: Si tu CartItemEntity lo requiere, podrías pasarle el item.source aquí también)
    const items = cart.items.map(item => 
      new CartItemEntity(item.id.toString(), item.productId.toString(), item.quantity)
    );

    return new CartEntity(cart.id.toString(), cart.userId.toString(), items);
  }

  // 1. Añadimos source como parámetro
  async addItemToCart(userId: string, productId: string, quantity: number, source: string): Promise<CartEntity> {
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
      // Si ya existe, le sumamos la cantidad y actualizamos el source
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { 
          quantity: existingItem.quantity + quantity,
          source: source // Guardamos la marca de agua
        }
      });
    } else {
      // Si no existe, creamos el nuevo item con su source
      await prisma.cartItem.create({
        data: { 
          cartId: cart.id, 
          productId: productIdInt, 
          quantity,
          source: source // Guardamos la marca de agua
        }
      });
    }

    // 3. Retornamos el carrito actualizado
    return this.getCart(userId);
  }
  // 3. Método para eliminar un producto del carrito
  async removeItemFromCart(userId: string, productId: string): Promise<CartEntity> {
    const userIdInt = parseInt(userId);
    const productIdInt = parseInt(productId);

    // 1. Buscamos el carrito del usuario
    const cart = await prisma.cart.findUnique({ 
      where: { userId: userIdInt } 
    });

    // Si por alguna razón no hay carrito, simplemente retornamos el estado actual (vacío)
    if (!cart) {
      return this.getCart(userId);
    }

    // 2. Eliminamos el producto específico de ese carrito
    // Usamos deleteMany porque es la forma más limpia de borrar coincidiendo dos columnas (cartId y productId) sin depender del ID único del CartItem
    await prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
        productId: productIdInt
      }
    });

    // 3. Retornamos el carrito actualizado consultando nuevamente a la base de datos
    return this.getCart(userId);
  }

  async updateItemQuantity(userId: string, productId: string, quantity: number): Promise<CartEntity> {
    const userIdInt = parseInt(userId);
    const productIdInt = parseInt(productId);

    // 1. Buscamos el carrito del usuario
    const cart = await prisma.cart.findUnique({ 
      where: { userId: userIdInt } 
    });

    if (!cart) return this.getCart(userId); // Si no hay carrito, devolvemos el actual

    // 2. Buscamos el item específico que queremos modificar
    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId: productIdInt }
    });

    // 3. Si el item existe, actualizamos su cantidad
    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: quantity } // Reemplazamos la cantidad vieja por la nueva
      });
    }

    // 4. Retornamos el carrito con los nuevos totales
    return this.getCart(userId);
  }


}