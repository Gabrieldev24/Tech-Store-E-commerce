import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { prisma } from '@/lib/data/postgres'; // Asegúrate de que esta sea la ruta correcta a tu instancia de prisma

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

export async function POST(request: Request) {
  try {
    // 1. MercadoPago envía el ID del pago en los parámetros de la URL
    const url = new URL(request.url);
    const id = url.searchParams.get('data.id') || url.searchParams.get('id');
    const type = url.searchParams.get('type') || url.searchParams.get('topic');

    // Si no es una notificación de pago, la ignoramos y respondemos 200 OK
    if (!id || type !== 'payment') {
      return NextResponse.json({ message: 'Ignorado' }, { status: 200 });
    }

    // 2. Buscamos el pago real en los servidores de MercadoPago
    const payment = await new Payment(client).get({ id });

    // 3. Verificamos si el pago fue exitoso
    if (payment.status === 'approved') {
      
      // ¡Atrapamos los datos ocultos! (MercadoPago convierte camelCase a snake_case)
      const source = payment.metadata?.source || 'web';
      const userIdStr = payment.metadata?.user_id;

      if (userIdStr && userIdStr !== 'guest') {
        const userIdInt = parseInt(userIdStr);

        // A. Buscamos el carrito del usuario con sus productos
        const cart = await prisma.cart.findUnique({
          where: { userId: userIdInt },
          include: { items: { include: { product: true } } }
        });

        if (cart && cart.items.length > 0) {
          // B. Calculamos el total
          const total = cart.items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

          // C. Creamos la Orden definitiva (con el origen techbot o web)
          await prisma.order.create({
            data: {
              userId: userIdInt,
              total: total,
              source: source, // ¡Llegamos a la meta!
              items: {
                create: cart.items.map(item => ({
                  productId: item.productId,
                  quantity: item.quantity,
                  price: item.product.price
                }))
              }
            }
          });

          // D. Vaciamos el carrito (borramos los items)
          await prisma.cartItem.deleteMany({
            where: { cartId: cart.id }
          });
        }
      }
    }

    // Siempre debemos responder rápido con un status 200 para que MercadoPago no reintente
    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error('Error en el Webhook de MercadoPago:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}