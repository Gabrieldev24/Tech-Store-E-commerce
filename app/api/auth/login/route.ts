import { NextResponse } from 'next/server';
import { PostgresAuthDataSourceImpl } from '@/core/infrastructure/datasources/postgres-auth.datasource';

import { LoginUser } from '@/core/domain/use-cases/auth/login-user.use-case';
import { JwtAdapter } from '@/core/config/jwt.adapter';
import { AuthRepositoryImpl } from '@/core/infrastructure/repository/auth.repository.impl';

export async function POST(request: Request) {
  try {
    // 1. Extraer las credenciales del body de la petición
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 2. Instanciar el flujo de la Arquitectura Limpia
    const datasource = new PostgresAuthDataSourceImpl();
    const repository = new AuthRepositoryImpl(datasource);
    const loginUserUseCase = new LoginUser(repository);

    // 3. Ejecutar la validación del login
    const userEntity = await loginUserUseCase.execute(email, password);

    // 4. Si las credenciales son correctas, le firmamos su pase VIP (JWT)
    const token = await JwtAdapter.generateToken({ id: userEntity.id, email: userEntity.email });

    // 5. Devolvemos el usuario y su token con un estado 200 OK
    return NextResponse.json({
      user: {
        id: userEntity.id,
        name: userEntity.name,
        email: userEntity.email,
        role: userEntity.role
      },
      token
    }, { status: 200 });

  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    
    // Si las credenciales fallaron, mandamos un 401 Unauthorized, si no, un 500
    const status = errorMessage === 'Invalid email or password' ? 401 : 500;

    return NextResponse.json({ error: errorMessage }, { status });
  }
}