import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';
// 🔥 VITAL: Importamos Prisma para poder guardar en tu base de datos
import { prisma } from '@/lib/data/postgres'; 

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, userId, customerData } = body;

    // 1. DETECTAR EL CANAL DE VENTA REAL DESDE EL CARRITO
    // Si al menos un producto del carrito vino del chatbot, le damos el crédito al bot
    const isFromBot = items.some((item: any) => item.source === 'techbot');
    const finalSource = isFromBot ? 'techbot' : 'web';

    // 2. CALCULAR EL TOTAL MATEMÁTICAMENTE
    const total = items.reduce((sum: number, item: any) => sum + (item.product.price * item.quantity), 0);

    // 3. ¡REGISTRAR LA ORDEN EN POSTGRES PRIMERO!
    const newOrder = await prisma.order.create({
      data: {
        userId: userId ? parseInt(userId) : 1, // Asegúrate de manejar usuarios anónimos si es necesario
        total: total,
        status: 'PENDING',
        source: finalSource, // 🔥 AQUÍ SE GUARDA 'techbot' o 'web' DIRECTO A TU BD
      }
    });

    // 4. PREPARAR DATOS PARA MERCADOPAGO
    const mpItems = items.map((item: any) => ({
      id: item.product.id.toString(),
      title: item.product.name,
      quantity: item.quantity,
      unit_price: Number(item.product.price),
      currency_id: 'PEN', 
    }));

    const preference = new Preference(client);
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cubaaprende.site';

    // 5. CREAR LA PREFERENCIA DE PAGO
    const result = await preference.create({
      body: {
        items: mpItems,
        payer: {
          name: customerData?.firstName || 'Guest',
          surname: customerData?.lastName || '',
          email: customerData?.email || 'guest@cubaaprende.site',
        },
        external_reference: newOrder.id.toString(), // 🔥 Conectamos el pago con el ID de Postgres
        metadata: {
          source: finalSource,
          order_id: newOrder.id.toString(),
        },
        back_urls: {
          success: `${baseUrl}/success`,
          failure: `${baseUrl}/cart`,
          pending: `${baseUrl}/cart`,
        },
        auto_return: 'approved',
      }
    });

    return NextResponse.json({ url: result.init_point }, { status: 200 });

  } catch (error: any) {
    console.error('Error detallado en el Checkout:', error);
    return NextResponse.json({ error: 'Error al generar link de pago' }, { status: 500 });
  }
}