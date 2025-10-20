import { RegisterCommand } from "../../commands";
import { IAuthRepository } from "../../repositories/IAuthRepository";

export class RegisterUserUseCase {
  constructor(private readonly authRepo: IAuthRepository) {}

  execute(cmd: RegisterCommand) {
    if (!cmd.credentials.email || !cmd.credentials.password) {
      throw new Error("Email and password are required");
    }

    return this.authRepo.register(cmd);
  }
}
