import { NextResponse } from 'next/server';
import { prisma } from '@/lib/data/postgres';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error("Error consultando Prisma:", error);
    return NextResponse.json({ error: 'Error cargando productos' }, { status: 500 });
  }
}


export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const newProduct = await prisma.product.create({
      data: {
        // Tu esquema usa un Int para el ID, así que generamos uno aleatorio seguro
        id: Math.floor(Math.random() * 1000000), 
        name: body.name,
        price: parseFloat(body.price),
        originalPrice: body.originalPrice ? parseFloat(body.originalPrice) : parseFloat(body.price),
        description: body.description || "Sin descripción",
        image: body.image || "https://via.placeholder.com/150",
        additionalImages: [], // Según tu esquema es un Json
        category: body.category || "General",
        rating: 5.0,
        reviews: 0,
        inStock: parseInt(body.stock) > 0,
        stock: parseInt(body.stock),
        specs: [],
      }
    });

    return NextResponse.json(newProduct);
  } catch (error) {
    console.error("Error guardando producto:", error);
    return NextResponse.json({ error: 'Error al guardar' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    
    // Validamos que nos envíen el ID del producto que quieren editar
    if (!body.id) {
      return NextResponse.json({ error: 'ID es obligatorio para actualizar' }, { status: 400 });
    }

    // Actualizamos la fila en la tabla de Postgres
    const updatedProduct = await prisma.product.update({
      where: { 
        id: parseInt(body.id) // Buscamos el producto por su ID
      },
      data: {
        name: body.name,
        price: parseFloat(body.price),
        originalPrice: body.originalPrice ? parseFloat(body.originalPrice) : parseFloat(body.price),
        description: body.description,
        image: body.image,
        category: body.category,
        inStock: parseInt(body.stock) > 0, // Si el stock es mayor a 0, hay disponibilidad
        stock: parseInt(body.stock),       // Guardamos el nuevo número de stock
      }
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("Error actualizando producto:", error);
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 });
  }
}