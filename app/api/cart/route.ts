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