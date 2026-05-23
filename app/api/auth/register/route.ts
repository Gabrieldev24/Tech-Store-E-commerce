import { NextResponse } from 'next/server';
import { PostgresAuthDataSourceImpl } from '@/core/infrastructure/datasources/postgres-auth.datasource';

import { JwtAdapter } from '@/core/config/jwt.adapter';
import { AuthRepositoryImpl } from '@/core/infrastructure/repository/auth.repository.impl';
import { RegisterUser } from '@/core/domain/use-cases/register-user.use-case';

// Next.js detecta que exportar una función "POST" manejará ese método HTTP
export async function POST(request: Request) {
  try {
    // 1. Leer los datos que vienen del formulario (name, email, password)
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 2. Instanciar la Arquitectura Limpia (Inyección de dependencias)
    const datasource = new PostgresAuthDataSourceImpl();
    const repository = new AuthRepositoryImpl(datasource);
    const registerUserUseCase = new RegisterUser(repository);

    // 3. Ejecutar el caso de uso
    const userEntity = await registerUserUseCase.execute(name, email, password);

    // 4. Generar su Token de sesión (JWT) usando el adaptador
    const token = await JwtAdapter.generateToken({ id: userEntity.id, email: userEntity.email });

    // 5. Responder al frontend con el usuario creado y su token
    return NextResponse.json({
      user: {
        id: userEntity.id,
        name: userEntity.name,
        email: userEntity.email,
        role: userEntity.role
      },
      token
    }, { status: 201 });

  } catch (error) {
    console.error(error);
    // Si el datasource lanzó el error "Email already exists", lo atrapamos aquí
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    const status = errorMessage === 'Email already exists' ? 400 : 500;

    return NextResponse.json({ error: errorMessage }, { status });
  }
}