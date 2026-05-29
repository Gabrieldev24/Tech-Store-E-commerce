import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

// 1. Inicializamos MercadoPago con tu token seguro
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Recibimos los items del carrito, origen y cliente
    const { items, source, userId, customerData } = body;

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

    // Forzamos tu dominio oficial como red de seguridad para evitar el error 400
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cubaaprende.site';

    const result = await preference.create({
      body: {
        items: mpItems,
        // Envolvemos la información de tu comprador si la necesitas luego
        payer: {
          name: customerData?.firstName || 'Guest',
          surname: customerData?.lastName || '',
          email: customerData?.email || 'guest@cubaaprende.site',
        },
        // ¡LA MAGIA! Aquí escondemos el origen de la venta y el ID
        metadata: {
          source: source || 'web',
          user_id: userId || 'guest', // MercadoPago prefiere snake_case
        },
        // A dónde regresa el cliente después de pagar en MercadoPago
        back_urls: {
          success: `${baseUrl}/success`,
          failure: `${baseUrl}/cart`, // Si falla, lo devolvemos al carrito
          pending: `${baseUrl}/cart`,
        },
        auto_return: 'approved',
      }
    });

    // 4. Devolvemos la URL del Checkout Pro al frontend
    return NextResponse.json({ url: result.init_point }, { status: 200 });

  } catch (error: any) {
    // Imprimimos el error exacto en los logs de Railway para mayor control
    console.error('Error detallado en MercadoPago:', error.cause || error.message || error);
    return NextResponse.json({ error: 'Error al generar link de pago' }, { status: 500 });
  }
}