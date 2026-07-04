import { NextResponse } from 'next/server';
import { PostgresCartDatasourceImpl } from '@/core/infrastructure/datasources/postgres-cart.datasource';

import { GetCart } from '@/core/domain/use-cases/cart/get-cart.use-case';
import { AddItemToCart } from '@/core/domain/use-cases/cart/add-item.use-case';
import { JwtAdapter } from '@/core/config/jwt.adapter';
import { CartRepositoryImpl } from '@/core/infrastructure/repository/cart.repository.impl';

// Extraer y validar el Token del usuario
function getUserIdFromToken(request: Request): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

  const token = authHeader.split(' ')[1];
  const payload = JwtAdapter.verifyToken(token);
  
  return payload ? payload.id : null;
}

// GET: Traer el carrito del usuario
export async function GET(request: Request) {
  try {
    const userId = getUserIdFromToken(request);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const datasource = new PostgresCartDatasourceImpl();
    const repository = new CartRepositoryImpl(datasource);
    const getCartUseCase = new GetCart(repository);

    const cart = await getCartUseCase.execute(userId);

    return NextResponse.json({ cart }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Agregar un producto al carrito
export async function POST(request: Request) {
  try {
    const userId = getUserIdFromToken(request);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // 1. ¡ATRAPAMOS EL SOURCE AQUÍ! (Le ponemos 'web' por defecto por seguridad)
    const { productId, quantity = 1, source = 'web' } = await request.json();

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const datasource = new PostgresCartDatasourceImpl();
    const repository = new CartRepositoryImpl(datasource);
    const addItemUseCase = new AddItemToCart(repository);

    // 2. SE LO PASAMOS AL CASO DE USO
    const cart = await addItemUseCase.execute(userId, productId, quantity, source);

    return NextResponse.json({ cart }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


// ==========================================
// PUT: Actualizar la cantidad de un producto
// ==========================================
export async function PUT(request: Request) {
  try {
    const userId = getUserIdFromToken(request);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // 1. Recibimos los datos que mandó la "Actualización Optimista" del Frontend
    const { productId, quantity } = await request.json();

    if (!productId || quantity === undefined) {
      return NextResponse.json({ error: 'Product ID y quantity son obligatorios' }, { status: 400 });
    }

    // 2. Instanciamos tu datasource de Postgres
    const datasource = new PostgresCartDatasourceImpl();
    
    // 3. Ejecutamos el método que creamos en el Paso 2
    const cart = await datasource.updateItemQuantity(userId, productId.toString(), quantity);

    return NextResponse.json({ cart }, { status: 200 });
  } catch (error) {
    console.error("Error en PUT /api/cart:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// ==========================================
// DELETE: Eliminar un producto del carrito (El basurero)
// ==========================================
export async function DELETE(request: Request) {
  try {
    const userId = getUserIdFromToken(request);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // 1. Extraemos el productId de la URL (ej: /api/cart?productId=123)
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ error: 'Product ID es obligatorio' }, { status: 400 });
    }

    // 2. Instanciamos tu datasource
    const datasource = new PostgresCartDatasourceImpl();
    
    // 3. Ejecutamos el método para eliminar que hicimos hace un rato
    const cart = await datasource.removeItemFromCart(userId, productId);

    return NextResponse.json({ cart }, { status: 200 });
  } catch (error) {
    console.error("Error en DELETE /api/cart:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}