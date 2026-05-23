import { UserEntity } from "../entities/UserEntity";


export abstract class AuthDataSource {
  
  abstract register(name: string, email: string, password: string): Promise<UserEntity>;
  
 
  abstract login(email: string, password: string): Promise<UserEntity>;
}