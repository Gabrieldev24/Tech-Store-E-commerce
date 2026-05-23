import bcrypt from 'bcrypt';
import { AuthDataSource } from '../../domain/datasources/auth.datasource';
import { prisma } from '@/lib/data/postgres';
import { UserEntity } from '@/core/domain/entities/UserEntity';

export class PostgresAuthDataSourceImpl implements AuthDataSource {

  async register(name: string, email: string, password: string): Promise<UserEntity> {
    try {
      // 1. Verificar si el correo ya existe en Postgres
      const exists = await prisma.user.findUnique({ where: { email } });
      if (exists) throw new Error('Email already exists');

      // 2. Encriptar la contraseña usando Bcrypt con 10 rondas
      const hashedPassword = bcrypt.hashSync(password, 10);

      // 3. Guardar el nuevo usuario en Postgres a través de Prisma
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword, // Guardamos el hash, no el texto plano
          role: 'CLIENT' // Rol por defecto
        }
      });

      // 4. Convertir el usuario de Prisma a nuestra Entidad limpia de Dominio
      // Convertimos el id (Int) a string para que encaje con nuestra UserEntity
      return UserEntity.fromObject({
        ...user,
        id: user.id.toString()
      });

    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error('Internal Server Error during registration');
    }
  }

  async login(email: string, password: string): Promise<UserEntity> {
      try {
        // 1. Buscar al usuario por su correo único en Postgres
        const user = await prisma.user.findUnique({ where: { email } });
        
        // Si no existe, lanzamos un error genérico (buena práctica de seguridad)
        if (!user) throw new Error('Invalid email or password');

        // 2. Comparar la contraseña en texto plano con el HASH guardado en la DB
        const isPasswordValid = bcrypt.compareSync(password, user.password);
        
        // Si no coincide, lanzamos el mismo error
        if (!isPasswordValid) throw new Error('Invalid email or password');

        // 3. Si todo está perfecto, retornamos nuestra Entidad limpia de Dominio
        return UserEntity.fromObject({
          ...user,
          id: user.id.toString()
        });

      } catch (error) {
        if (error instanceof Error) throw error;
        throw new Error('Internal Server Error during login');
      }
    }
}