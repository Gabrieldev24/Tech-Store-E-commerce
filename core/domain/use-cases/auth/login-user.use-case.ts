import { UserEntity } from "../../entities/UserEntity";
import { AuthRepository } from "../../repositories/AuthRepository";


interface LoginUserUseCase {
  execute(email: string, password: string): Promise<UserEntity>;
}

export class LoginUser implements LoginUserUseCase {

  constructor(
    private readonly repository: AuthRepository
  ) {}

  public async execute(email: string, password: string): Promise<UserEntity> {
    return await this.repository.login(email, password);
  }
}