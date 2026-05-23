import { UserEntity } from "../entities/UserEntity";
import { AuthRepository } from "../repositories/AuthRepository";


// Definimos una interfaz para saber qué datos requiere este caso de uso
interface RegisterUserUseCase {
  execute(name: string, email: string, password: string): Promise<UserEntity>;
}

export class RegisterUser implements RegisterUserUseCase {

  // Inyectamos el repositorio
  constructor(
    private readonly repository: AuthRepository
  ) {}

  public async execute(name: string, email: string, password: string): Promise<UserEntity> {
    // Aquí podrías agregar reglas de negocio extra si hiciera falta
    return await this.repository.register(name, email, password);
  }
}