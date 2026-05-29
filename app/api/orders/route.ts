import { NextResponse } from 'next/server';
import { prisma } from '@/lib/data/postgres'; // Asegúrate de que esta sea la ruta correcta a tu archivo prisma.ts

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      // Si tienes la relación con el usuario en tu base de datos, descomenta la siguiente línea:
      // include: { user: true } 
    });
    
    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error consultando Prisma:", error);
    return NextResponse.json({ error: 'Error cargando ordenes' }, { status: 500 });
  }
}