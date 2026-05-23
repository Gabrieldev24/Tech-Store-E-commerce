
import { AuthRepository } from '@/core/domain/repositories/AuthRepository';
import { AuthDataSource } from '../../domain/datasources/auth.datasource';
import { UserEntity } from '@/core/domain/entities/UserEntity';


export class AuthRepositoryImpl implements AuthRepository {
  
  // Inyección de dependencias: le pasamos el datasource por el constructor
  constructor(
    private readonly datasource: AuthDataSource
  ) {}

  register(name: string, email: string, password: string): Promise<UserEntity> {
    return this.datasource.register(name, email, password);
  }

  login(email: string, password: string): Promise<UserEntity> {
    return this.datasource.login(email, password);
  }
}