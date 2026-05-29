import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

// 1. Inicializamos MercadoPago con tu token seguro
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Recibimos los items del carrito y nuestro rastreador
    const { items, source, userId } = body;

    // 2. Formateamos tus productos exactamente como MercadoPago los exige
    const mpItems = items.map((item: any) => ({
      id: item.product.id.toString(),
      title: item.product.name,
      quantity: item.quantity,
      unit_price: Number(item.product.price),
      currency_id: 'PEN', // Soles peruanos
    }));

    // 3. Creamos la "Preferencia de pago"
    const preference = new Preference(client);

    // Usaremos localhost para probar hoy, luego lo cambiaremos a tu dominio en Railway
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const result = await preference.create({
      body: {
        items: mpItems,
        // ¡LA MAGIA! Aquí escondemos el origen de la venta (techbot o web)
        metadata: {
          source: source || 'web',
          userId: userId || 'guest',
        },
        back_urls: {
          success: `${baseUrl}/checkout/success`,
          failure: `${baseUrl}/checkout/failure`,
          pending: `${baseUrl}/checkout/pending`,
        },
        auto_return: 'approved',
      }
    });

    // 4. Devolvemos la URL del Checkout Pro al frontend
    return NextResponse.json({ url: result.init_point }, { status: 200 });

  } catch (error) {
    console.error('Error en MercadoPago:', error);
    return NextResponse.json({ error: 'Error al generar link de pago' }, { status: 500 });
  }
}